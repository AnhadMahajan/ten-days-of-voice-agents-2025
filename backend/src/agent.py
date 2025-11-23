# agent.py
import asyncio
import logging
import json
import os
import time
from dotenv import load_dotenv

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    RoomInputOptions,
    WorkerOptions,
    cli,
    metrics,
    tokenize,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

# Import event type here (used in handler signature)
from livekit.agents import UserInputTranscribedEvent

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""
You are BrewBuddy, a friendly barista for BrewVerse Coffee. The user places voice orders.
Ask short clarifying questions until you have collected:
drinkType, size, milk, extras (list), and name.
Use plain, concise sentences. Confirm the order when complete.
"""
        )


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Build the voice pipeline
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="en-US-matthew",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    # Metrics collection
    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: {summary}")

    ctx.add_shutdown_callback(log_usage)

    # Helper: initialize per-session order state
    def init_order_state(s):
        order = {
            "drinkType": None,
            "size": None,
            "milk": None,
            "extras": [],  # list of strings
            "name": None,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        setattr(s, "order_state", order)
        # Also keep a small 'step' pointer for flow control (0..4)
        setattr(s, "order_step", 0)
        return order

    # Helper: persist order to JSON file
    async def save_order_to_json(order):
        os.makedirs("orders", exist_ok=True)
        # safe filename: include timestamp and name if present
        safe_name = order.get("name") or "anonymous"
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"orders/order_{timestamp}_{safe_name.replace(' ', '_')}.json"
        try:
            with open(filename, "w", encoding="utf-8") as fh:
                json.dump(order, fh, indent=4, ensure_ascii=False)
            logger.info(f"Saved order to {filename}")
            return filename
        except Exception:
            logger.exception("Failed to save order JSON")
            return None

    # Core order processing. Returns a text reply to speak back to the user.
    async def process_order_turn(s, transcript: str):
        # ensure order state present
        order = getattr(s, "order_state", None)
        step = getattr(s, "order_step", 0)
        if order is None:
            order = init_order_state(s)
            step = 0

        text = transcript.strip()
        text_l = text.lower()

        # Helper to interpret "no" or "none"
        def is_none_answer(t):
            return t.strip().lower() in ("no", "none", "nope", "nothing", "n")

        # Step flow:
        # 0 - drinkType
        # 1 - size
        # 2 - milk
        # 3 - extras
        # 4 - name -> finish
        if step == 0:
            # If user said something like "I'd like a latte" then capture drinkType
            order["drinkType"] = text
            setattr(s, "order_step", 1)
            return "Great. What size would you like? small, medium, or large"

        if step == 1:
            # normalize size
            if "small" in text_l:
                order["size"] = "small"
            elif "large" in text_l:
                order["size"] = "large"
            elif "medium" in text_l:
                order["size"] = "medium"
            else:
                # If unclear, accept the text as-is (user may say "regular")
                order["size"] = text
            setattr(s, "order_step", 2)
            return "Okay. Which milk would you prefer? (dairy, oat, almond, soy, skim)"

        if step == 2:
            order["milk"] = text
            setattr(s, "order_step", 3)
            return "Any extras? For example, whipped cream, caramel, extra shot. Say 'no' if none."

        if step == 3:
            if is_none_answer(text):
                order["extras"] = []
            else:
                # split by commas or 'and'
                parts = [p.strip() for p in text.replace(" and ", ",").split(",") if p.strip()]
                order["extras"] = parts
            setattr(s, "order_step", 4)
            return "Perfect. Can I get the name for the order please?"

        if step == 4:
            order["name"] = text
            # finished
            setattr(s, "order_step", 5)
            # store a finished_at time
            order["finished_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
            # persist JSON
            saved = await save_order_to_json(order)
            # Build confirmation summary
            extras_display = ", ".join(order["extras"]) if order["extras"] else "no extras"
            summary = (
                f"Thanks {order['name']}. I have a {order['size']} {order['drinkType']} "
                f"with {order['milk']} milk and {extras_display}. "
                "Your order has been saved and will be ready shortly."
            )
            if saved:
                summary += f" (saved to {saved})"
            return summary

        # If step >=5 (already completed)
        return "Your order is already complete. If you want to place another order, say 'new order'."

    # --- IMPORTANT CHANGE: event handler must be synchronous ---
    # We'll create an async handler and run it via asyncio.create_task from a sync wrapper.

    async def handle_transcription(event: UserInputTranscribedEvent):
        """
        Async transcription handler that contains the original logic.
        This is scheduled from the synchronous wrapper below.
        """
        # react only to final transcripts
        if not getattr(event, "is_final", True):
            return

        user_text = getattr(event, "transcript", "").strip()
        if not user_text:
            return

        logger.info(f"User said: {user_text}")

        # if user says "new order" or "start over", reset state
        if user_text.lower() in ("new order", "start over", "restart"):
            init_order_state(session)
            await session.say("Sure. What would you like to order today?", allow_interruptions=True)
            return

        # If no order state yet, initialize and treat this first utterance as drinkType
        if not hasattr(session, "order_state"):
            init_order_state(session)
            # Treat the incoming transcript as the drinkType (common pattern)
            reply = await process_order_turn(session, user_text)
            await session.say(reply, allow_interruptions=True)
            return

        # Otherwise, continue the stepwise conversation
        reply = await process_order_turn(session, user_text)
        await session.say(reply, allow_interruptions=True)

    # synchronous wrapper required by .on()
    @session.on("user_input_transcribed")
    def on_user_input_transcribed(event: UserInputTranscribedEvent):
        # schedule async handler; do not await here
        try:
            asyncio.create_task(handle_transcription(event))
        except RuntimeError:
            # In rare situations there may be no running loop; get/create one and schedule
            loop = None
            try:
                loop = asyncio.get_event_loop()
            except Exception:
                loop = None
            if loop and loop.is_running():
                loop.create_task(handle_transcription(event))
            else:
                # fallback: run in a new loop (should be rare)
                asyncio.run(handle_transcription(event))

    # Start the session and connect to the room
    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    # Optional: greet the user when the session is ready
    # initialize order state so greeting flow is consistent
    init_order_state(session)
    await session.say("Welcome to BrewVerse. What would you like to order today?", allow_interruptions=True)

    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
