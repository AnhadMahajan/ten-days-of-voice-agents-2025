import json
import logging
import os
import random
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional, Annotated
from dotenv import load_dotenv
from pydantic import Field
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    RoomInputOptions,
    WorkerOptions,
    cli,
    function_tool,
    RunContext,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

# -------------------------
# Logging
# -------------------------
logger = logging.getLogger("improv_battle_agent")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logger.addHandler(handler)
load_dotenv(".env.local")

# -------------------------
# Enhanced Improv Scenarios
# -------------------------
SCENARIOS = [
    "You are a barista who has to tell a customer that their latte is actually a portal to another dimension.",
    "You are a time-travelling tour guide explaining modern smartphones to someone from the 1800s.",
    "You are a restaurant waiter who must calmly tell a customer that their order has escaped the kitchen.",
    "You are a customer trying to return an obviously cursed object to a very skeptical shop owner.",
    "You are a taxi driver who just realized your passenger is a ghost from the 1920s.",
    "You are a librarian trying to convince someone that the books are gossiping about them.",
    "You are a tech support agent helping a medieval knight troubleshoot their dragon.",
    "You are a yoga instructor whose class has been invaded by extremely competitive penguins.",
    "You are a detective interrogating a houseplant as your only witness to a crime.",
    "You are a chef on a cooking show, but all your ingredients have started talking back.",
    "You are an astronaut who just discovered the ship's coffee machine has developed a personality.",
    "You are a nervous wedding officiant who keeps getting the couple's names hilariously wrong.",
    "You are a ghost trying to give a performance review to a living employee who can't see you.",
    "You are a medieval king reacting to a food delivery app representative showing up at court.",
    "You are a dentist trying to calm down a patient who insists they're a vampire and can't open their mouth.",
]

# -------------------------
# Per-session Game State
# -------------------------
@dataclass
class ImprovGameState:
    player_name: Optional[str] = None
    current_round: int = 0
    max_rounds: int = 4
    phase: str = "idle"  # "idle" | "intro" | "awaiting_improv" | "reacting" | "done"
    rounds: List[Dict] = field(default_factory=list)
    used_scenario_indices: List[int] = field(default_factory=list)
    session_started_at: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    
    def pick_fresh_scenario(self) -> str:
        """Pick a scenario that hasn't been used this session."""
        available = [i for i in range(len(SCENARIOS)) if i not in self.used_scenario_indices]
        
        # Reset if we've exhausted all scenarios
        if not available:
            self.used_scenario_indices = []
            available = list(range(len(SCENARIOS)))
        
        idx = random.choice(available)
        self.used_scenario_indices.append(idx)
        return SCENARIOS[idx]
    
    def generate_dynamic_reaction(self, performance_text: str) -> str:
        """Generate varied, context-aware host reactions."""
        perf_lower = performance_text.lower()
        
        # Analyze performance characteristics
        has_emotion = any(w in perf_lower for w in ['sad', 'angry', 'excited', 'scared', 'love', 'hate', 'cry'])
        has_humor = any(w in perf_lower for w in ['funny', 'haha', 'lol', 'joke', 'laugh'])
        is_short = len(performance_text.split()) < 15
        has_character_voice = any(phrase in perf_lower for phrase in ['i am', "i'm a", 'as a', 'my name is'])
        has_questions = '?' in performance_text
        
        # Choose reaction tone
        reaction_types = []
        
        if has_humor:
            reaction_types.extend(['praise_humor', 'acknowledge_humor'])
        if has_emotion:
            reaction_types.extend(['praise_emotion', 'note_emotion'])
        if is_short:
            reaction_types.append('encourage_expansion')
        if has_character_voice:
            reaction_types.append('praise_commitment')
        if has_questions:
            reaction_types.append('note_technique')
        
        # Default options if nothing specific detected
        if not reaction_types:
            reaction_types = ['neutral_positive', 'constructive', 'playful_tease']
        
        reaction_type = random.choice(reaction_types)
        
        # Generate reaction based on type
        reactions = {
            'praise_humor': [
                "Ha! That was genuinely funny. Great comedic timing.",
                "Okay, you got me laughing with that one. Nice work!",
                "Love the humor! You found the funny in the absurd."
            ],
            'acknowledge_humor': [
                "I see what you were going for with the comedy. It landed in spots.",
                "The humor was there - maybe lean into it even more next time."
            ],
            'praise_emotion': [
                "Wow, real emotional depth there. I felt that.",
                "You brought genuine emotion to that scene. Impressive.",
                "That emotional color really elevated the performance."
            ],
            'note_emotion': [
                "I liked the emotional choice. Could push it further though.",
                "Good instinct on the emotion - don't be afraid to really go there."
            ],
            'encourage_expansion': [
                "That was bold but brief. Try adding more detail next time.",
                "Good start! Next round, really explore the scenario more.",
                "You had the right idea - just needed a bit more meat on those bones."
            ],
            'praise_commitment': [
                "Love the character commitment! You really became that role.",
                "Full commitment to the character - that's what I want to see!",
                "You sold that character completely. Excellent."
            ],
            'note_technique': [
                "Interesting use of questions - that's an advanced technique.",
                "I see you playing with different improv tools. Nice experimentation."
            ],
            'neutral_positive': [
                "Solid work. You made clear choices and stuck with them.",
                "That worked. Good commitment to the premise.",
                "Nice. You understood the assignment and delivered."
            ],
            'constructive': [
                "That was fine, but I think you could push the absurdity more.",
                "You're on the right track - just needs bolder choices.",
                "Decent foundation. Next time, really heighten the stakes."
            ],
            'playful_tease': [
                "Okay, interesting interpretation! Not sure where you were going but points for confidence.",
                "That was... certainly a choice! Hey, commitment counts.",
                "Well, you definitely took a swing at it. Can't fault the effort."
            ]
        }
        
        return random.choice(reactions[reaction_type])

# -------------------------
# Agent Tools
# -------------------------
@function_tool
async def initialize_game(
    ctx: RunContext[ImprovGameState],
    player_name: Annotated[str, Field(description="The contestant's name")],
    num_rounds: Annotated[int, Field(default=4, description="Number of improv rounds (3-5 recommended)")] = 4,
) -> str:
    """Initialize the improv battle game with player info."""
    state = ctx.userdata
    
    state.player_name = player_name.strip()
    state.max_rounds = max(3, min(num_rounds, 6))  # Clamp between 3-6
    state.current_round = 0
    state.rounds = []
    state.used_scenario_indices = []
    state.phase = "intro"
    
    welcome = (
        f"Welcome to IMPROV BATTLE, {state.player_name}! "
        f"I'm your host and we're doing {state.max_rounds} rapid-fire improv rounds tonight. "
        f"Here's how it works: I give you a wild scenario, you improvise the scene, "
        f"I react and critique, then we move on. "
        f"When you're done with a scene, just say 'end scene' or pause naturally. "
        f"Ready to jump in?"
    )
    
    return welcome

@function_tool
async def launch_next_round(
    ctx: RunContext[ImprovGameState],
) -> str:
    """Present the next improv scenario to the contestant."""
    state = ctx.userdata
    
    if state.phase == "done":
        return "We've wrapped up all rounds! Say 'end show' for your final summary."
    
    if state.current_round >= state.max_rounds:
        state.phase = "done"
        return "That's all our rounds! Time for your closing notes."
    
    # Advance to next round
    state.current_round += 1
    scenario = state.pick_fresh_scenario()
    
    state.rounds.append({
        "round_number": state.current_round,
        "scenario": scenario,
        "performance": "",
        "reaction": "",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })
    
    state.phase = "awaiting_improv"
    
    announcement = (
        f"Round {state.current_round} of {state.max_rounds}. "
        f"Here's your scenario: {scenario} "
        f"Aaaaaand... ACTION!"
    )
    
    return announcement

@function_tool
async def capture_performance(
    ctx: RunContext[ImprovGameState],
    performance_summary: Annotated[str, Field(description="Brief summary or key moments from the player's improv")],
) -> str:
    """Record the player's performance and generate host reaction."""
    state = ctx.userdata
    
    if not state.rounds or state.current_round == 0:
        return "No active round to record performance for. Start a new round first!"
    
    # Get current round
    current = state.rounds[state.current_round - 1]
    current["performance"] = performance_summary
    
    # Generate dynamic reaction
    reaction = state.generate_dynamic_reaction(performance_summary)
    current["reaction"] = reaction
    
    state.phase = "reacting"
    
    # Check if this was the final round
    if state.current_round >= state.max_rounds:
        state.phase = "done"
        return f"{reaction} And that wraps our {state.max_rounds} rounds! Ready for your final evaluation?"
    
    return f"{reaction} Ready for round {state.current_round + 1}?"

@function_tool
async def deliver_final_summary(
    ctx: RunContext[ImprovGameState],
) -> str:
    """Provide closing summary and player evaluation."""
    state = ctx.userdata
    
    if not state.rounds:
        return "We didn't complete any rounds. Thanks for stopping by Improv Battle!"
    
    completed = [r for r in state.rounds if r.get("performance")]
    
    # Analyze overall performance style
    all_performances = " ".join([r["performance"] for r in completed]).lower()
    
    is_emotional = sum(1 for w in ['sad', 'angry', 'excited', 'love', 'cry', 'scared'] if w in all_performances) > 2
    is_comedic = sum(1 for w in ['funny', 'haha', 'joke', 'laugh'] if w in all_performances) > 2
    uses_questions = sum(1 for r in completed if '?' in r["performance"]) > len(completed) / 2
    commits_to_character = sum(1 for r in completed if any(p in r["performance"].lower() for p in ['i am', "i'm", 'as a'])) > len(completed) / 2
    
    # Build personality profile
    traits = []
    if is_comedic:
        traits.append("a natural comedian who finds humor in absurdity")
    if is_emotional:
        traits.append("an emotional performer who commits to feelings")
    if uses_questions:
        traits.append("a curious improviser who uses questions to explore")
    if commits_to_character:
        traits.append("a strong character actor who fully inhabits roles")
    
    if not traits:
        traits.append("a bold experimenter who takes interesting risks")
    
    style_description = random.choice(traits)
    
    # Highlight a standout moment
    standout = None
    for r in completed:
        if len(r["performance"].split()) > 20:  # Longer performances
            standout = r
            break
    
    if not standout and completed:
        standout = completed[0]
    
    summary = (
        f"Alright {state.player_name}, here's what I saw from you tonight. "
        f"You completed {len(completed)} rounds, and you're {style_description}. "
    )
    
    if standout:
        summary += (
            f"Your standout moment? Round {standout['round_number']} - {standout['scenario'][:60]}... "
            f"You really brought something special there. "
        )
    
    summary += (
        f"Overall: keep making bold choices, stay committed to the moment, and don't second-guess yourself. "
        f"Thanks for playing Improv Battle! Come back anytime."
    )
    
    state.phase = "done"
    return summary

@function_tool
async def terminate_show_early(
    ctx: RunContext[ImprovGameState],
) -> str:
    """End the show before completing all rounds."""
    state = ctx.userdata
    state.phase = "done"
    
    completed = len([r for r in state.rounds if r.get("performance")])
    
    return (
        f"No problem, {state.player_name}! You completed {completed} scenes. "
        f"That takes guts. Come back when you want to finish what you started. "
        f"Thanks for playing Improv Battle!"
    )

@function_tool
async def check_game_status(
    ctx: RunContext[ImprovGameState],
) -> str:
    """Get current game progress and status."""
    state = ctx.userdata
    
    completed = len([r for r in state.rounds if r.get("performance")])
    
    return (
        f"Player: {state.player_name or 'Not set'} | "
        f"Phase: {state.phase} | "
        f"Round: {state.current_round}/{state.max_rounds} | "
        f"Completed scenes: {completed}"
    )

# -------------------------
# The Improv Battle Host Agent
# -------------------------
class ImprovBattleHost(Agent):
    def __init__(self):
        instructions = """
You are the charismatic, quick-witted host of "IMPROV BATTLE" - a fast-paced voice improv game show.

YOUR PERSONALITY:
- High-energy and engaging, like a game show host meets improv coach
- Honest but never cruel - you give real feedback, not just cheerleading
- Quick with reactions - surprise, delight, confusion, mild disappointment
- Use natural, conversational language perfect for voice
- Keep responses SHORT and PUNCHY for TTS clarity

GAME FLOW:

1. WELCOME & SETUP:
   - Greet warmly and ask for their name
   - Call initialize_game with their name
   - Explain rules briefly and build excitement
   - Jump straight into Round 1

2. EACH ROUND:
   - Call launch_next_round to get and present the scenario
   - Add energy: "Aaand... ACTION!" or "Lights up!"
   - LET THEM PERFORM - don't interrupt
   - Listen carefully to what they improvise

3. AFTER EACH PERFORMANCE:
   - Call capture_performance with a brief summary of what they did
   - The tool will generate a reaction - deliver it with appropriate energy
   - Vary your delivery: excited, thoughtful, playfully skeptical, impressed
   - Keep it conversational: "Okay, that was wild!" or "Hmm, interesting choice there"
   - Immediately transition to next round

4. CLOSING:
   - After final round, call deliver_final_summary
   - Deliver the summary with warmth and genuine appreciation
   - Mention specific moments that stood out
   - End on an upbeat note

CRITICAL RULES:
- If they say "stop", "quit", "end show", or "I'm done", call terminate_show_early
- Never break character as the host
- Don't over-explain or lecture
- React authentically - vary between impressed, constructive, and playfully critical
- Keep all responses under 3-4 sentences unless it's the opening or closing
- Use check_game_status only if you lose track of where you are

TOOL USAGE:
- initialize_game: Start the show with player name
- launch_next_round: Present each new scenario
- capture_performance: After they improvise, record and get reaction
- deliver_final_summary: Final evaluation after all rounds
- terminate_show_early: Graceful early exit
- check_game_status: Check progress if needed

Remember: This is ENTERTAINMENT. Make it fun, dynamic, and feel like a real TV show!
        """
        super().__init__(
            instructions=instructions,
            tools=[
                initialize_game,
                launch_next_round,
                capture_performance,
                deliver_final_summary,
                terminate_show_early,
                check_game_status,
            ],
        )

# -------------------------
# Entrypoint & Prewarm
# -------------------------
def prewarm(proc: JobProcess):
    try:
        proc.userdata["vad"] = silero.VAD.load()
        logger.info("✅ VAD model prewarmed successfully")
    except Exception as e:
        logger.warning(f"⚠️  VAD prewarm failed: {e}")

async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}
    logger.info("\n" + "🎭" * 20)
    logger.info("🎬 IMPROV BATTLE - Voice Game Show Agent Starting...")
    logger.info("🎭" * 20 + "\n")
    
    game_state = ImprovGameState()
    
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="en-US-marcus",
            style="Conversational",
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata.get("vad"),
        userdata=game_state,
    )
    
    await session.start(
        agent=ImprovBattleHost(),
        room=ctx.room,
        room_input_options=RoomInputOptions(noise_cancellation=noise_cancellation.BVC()),
    )
    
    await ctx.connect()
    logger.info("🎙️  Improv Battle session connected and ready!")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))