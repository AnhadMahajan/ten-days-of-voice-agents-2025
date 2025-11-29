import logging
import json
import os
import random
from typing import Annotated, Optional, List, Dict
from dataclasses import dataclass, field
from datetime import datetime

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

logger = logging.getLogger("agent")
load_dotenv(".env.local")

# Game Configuration
WORLD_STATE_FILE = "world_state.json"
SAVE_GAME_DIR = "saved_games"

# Initialize world state structure
DEFAULT_WORLD_STATE = {
    "player": {
        "name": "Unknown Pirate",
        "crew_role": "Captain",
        "health": 100,
        "max_health": 100,
        "level": 1,
        "bounty": 0,
        "devil_fruit": None,
        "haki_types": [],
        "inventory": ["Rusty Sword", "Treasure Map Fragment"],
        "stats": {
            "strength": 10,
            "agility": 10,
            "willpower": 10,
            "luck": 10
        }
    },
    "location": {
        "current": "Windmill Village",
        "island": "Dawn Island",
        "sea": "East Blue",
        "description": "A peaceful village where your adventure begins",
        "paths": ["Forest Path", "Harbor", "Village Square"]
    },
    "npcs": {
        "barkeeper_makino": {
            "name": "Makino",
            "role": "Barkeeper",
            "attitude": "friendly",
            "location": "Windmill Village",
            "alive": True,
            "dialogue": "Welcome! Are you ready to set sail?"
        }
    },
    "events": [
        "Started adventure in Windmill Village"
    ],
    "quests": {
        "active": [
            {
                "name": "Set Sail for Adventure",
                "description": "Find a ship and crew to begin your journey on the Grand Line",
                "objective": "Recruit at least one crew member and acquire a ship",
                "completed": False
            }
        ],
        "completed": []
    },
    "flags": {
        "has_ship": False,
        "entered_grand_line": False,
        "first_devil_fruit_seen": False,
        "marine_encounters": 0,
        "treasure_found": 0
    },
    "turn_count": 0
}

def init_world_state():
    """Initialize world state JSON file"""
    if not os.path.exists(WORLD_STATE_FILE):
        with open(WORLD_STATE_FILE, 'w') as f:
            json.dump(DEFAULT_WORLD_STATE, f, indent=2)
        print(f"✅ World state created: {WORLD_STATE_FILE}")
    
    # Create saved games directory
    if not os.path.exists(SAVE_GAME_DIR):
        os.makedirs(SAVE_GAME_DIR)
        print(f"✅ Saved games directory created: {SAVE_GAME_DIR}")

def load_world_state():
    """Load world state from JSON file"""
    with open(WORLD_STATE_FILE, 'r') as f:
        return json.load(f)

def save_world_state(state: Dict):
    """Save world state to JSON file"""
    with open(WORLD_STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

@dataclass
class GameState:
    """Game state wrapper"""
    world: Dict
    agent_session: Optional[AgentSession] = None

@function_tool
async def check_character_sheet(
    ctx: RunContext[GameState]
) -> str:
    """📋 Check your character sheet with stats, inventory, and abilities."""
    
    world = ctx.userdata.world
    player = world["player"]
    
    response = f"""⚔️ **{player['name'].upper()} - {player['crew_role']}**

💪 **STATS:**
- Health: {player['health']}/{player['max_health']} HP
- Level: {player['level']}
- Bounty: {player['bounty']:,} Berries

📊 **ATTRIBUTES:**
- Strength: {player['stats']['strength']}
- Agility: {player['stats']['agility']}
- Willpower: {player['stats']['willpower']}
- Luck: {player['stats']['luck']}

🎒 **INVENTORY:**
{chr(10).join(f"- {item}" for item in player['inventory'])}

🍎 **DEVIL FRUIT:** {player['devil_fruit'] or 'None'}

💫 **HAKI:** {', '.join(player['haki_types']) if player['haki_types'] else 'Not awakened yet'}

⭐ **BOUNTY:** {player['bounty']:,} Berries"""
    
    return response

@function_tool
async def check_location(
    ctx: RunContext[GameState]
) -> str:
    """🗺️ Check your current location and available paths."""
    
    world = ctx.userdata.world
    location = world["location"]
    
    response = f"""📍 **CURRENT LOCATION:**
{location['current']} - {location['island']} ({location['sea']})

{location['description']}

🧭 **AVAILABLE PATHS:**
{chr(10).join(f"- {path}" for path in location['paths'])}"""
    
    return response

@function_tool
async def view_quests(
    ctx: RunContext[GameState]
) -> str:
    """📜 View your active and completed quests."""
    
    world = ctx.userdata.world
    quests = world["quests"]
    
    response = "📜 **QUEST LOG:**\n\n"
    
    if quests["active"]:
        response += "**ACTIVE QUESTS:**\n"
        for quest in quests["active"]:
            status = "✅" if quest["completed"] else "📌"
            response += f"{status} {quest['name']}\n"
            response += f"   {quest['description']}\n"
            response += f"   Objective: {quest['objective']}\n\n"
    
    if quests["completed"]:
        response += "**COMPLETED QUESTS:**\n"
        for quest in quests["completed"]:
            response += f"✅ {quest['name']}\n"
    
    if not quests["active"] and not quests["completed"]:
        response += "No quests yet! Your adventure awaits!"
    
    return response

@function_tool
async def roll_dice(
    ctx: RunContext[GameState],
    stat: Annotated[str, Field(description="Stat to use: strength, agility, willpower, or luck")],
    difficulty: Annotated[int, Field(description="Difficulty level (5-20)", default=10)] = 10
) -> str:
    """🎲 Roll a d20 check with stat modifier against a difficulty."""
    
    world = ctx.userdata.world
    player = world["player"]
    
    # Roll d20
    roll = random.randint(1, 20)
    
    # Get stat modifier
    stat_value = player["stats"].get(stat.lower(), 10)
    modifier = (stat_value - 10) // 2  # D&D style modifier
    
    total = roll + modifier
    
    # Determine success
    if roll == 20:
        result = "🌟 **CRITICAL SUCCESS!** Natural 20!"
        success = True
        critical = True
    elif roll == 1:
        result = "💥 **CRITICAL FAILURE!** Natural 1!"
        success = False
        critical = True
    elif total >= difficulty:
        result = f"✅ **SUCCESS!** (Needed {difficulty})"
        success = True
        critical = False
    else:
        result = f"❌ **FAILURE!** (Needed {difficulty})"
        success = False
        critical = False
    
    response = f"""🎲 **{stat.upper()} CHECK:**
Roll: {roll} + {modifier} ({stat} modifier) = {total}
Difficulty: {difficulty}

{result}"""
    
    # Store roll result in world state for GM to use
    world["last_roll"] = {
        "roll": roll,
        "modifier": modifier,
        "total": total,
        "difficulty": difficulty,
        "success": success,
        "critical": critical,
        "stat": stat
    }
    save_world_state(world)
    
    return response

@function_tool
async def update_world_state(
    ctx: RunContext[GameState],
    updates: Annotated[str, Field(description="JSON string of updates to apply to world state")]
) -> str:
    """🔄 Update the world state (used by GM to track changes)."""
    
    try:
        world = ctx.userdata.world
        update_data = json.loads(updates)
        
        # Apply updates recursively
        def apply_updates(target, source):
            for key, value in source.items():
                if isinstance(value, dict) and key in target and isinstance(target[key], dict):
                    apply_updates(target[key], value)
                else:
                    target[key] = value
        
        apply_updates(world, update_data)
        
        # Increment turn count
        world["turn_count"] = world.get("turn_count", 0) + 1
        
        # Save state
        save_world_state(world)
        
        return "✅ World state updated successfully."
    except Exception as e:
        return f"❌ Failed to update world state: {str(e)}"

@function_tool
async def save_game(
    ctx: RunContext[GameState],
    save_name: Annotated[str, Field(description="Name for this save file")]
) -> str:
    """💾 Save the current game state."""
    
    world = ctx.userdata.world
    
    # Create save data
    save_data = {
        "timestamp": datetime.now().isoformat(),
        "save_name": save_name,
        "world_state": world
    }
    
    # Save to file
    safe_filename = "".join(c if c.isalnum() or c in ('-', '_') else '_' for c in save_name)
    save_path = f"{SAVE_GAME_DIR}/save_{safe_filename}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    with open(save_path, 'w') as f:
        json.dump(save_data, f, indent=2)
    
    print(f"✅ Game saved: {save_path}")
    
    return f"💾 Game saved successfully as '{save_name}'! You can load this save anytime to continue your adventure."

@function_tool
async def add_to_inventory(
    ctx: RunContext[GameState],
    item_name: Annotated[str, Field(description="Name of the item to add")]
) -> str:
    """📦 Add an item to your inventory."""
    
    world = ctx.userdata.world
    player = world["player"]
    
    player["inventory"].append(item_name)
    save_world_state(world)
    
    return f"✅ Added {item_name} to your inventory!"

@function_tool
async def remove_from_inventory(
    ctx: RunContext[GameState],
    item_name: Annotated[str, Field(description="Name of the item to remove")]
) -> str:
    """🗑️ Remove an item from your inventory."""
    
    world = ctx.userdata.world
    player = world["player"]
    
    if item_name in player["inventory"]:
        player["inventory"].remove(item_name)
        save_world_state(world)
        return f"✅ Removed {item_name} from your inventory."
    else:
        return f"❌ You don't have {item_name} in your inventory."

class OnePieceGameMaster(Agent):
    def __init__(self):
        super().__init__(
            instructions="""🏴‍☠️ **YOU ARE THE ONE PIECE GAME MASTER!**

You are running an epic D&D-style adventure set in the world of ONE PIECE! You narrate the story, control NPCs, describe scenes, and guide the player through their pirate adventure.

🌊 **WORLD & SETTING:**
- The world of One Piece: Grand Line, East Blue, Devil Fruits, Haki, Marines, Pirates
- Tone: Adventurous, dramatic, with moments of humor and camaraderie
- Atmosphere: Capture the spirit of ONE PIECE - dreams, adventure, friendship, and the Will of D!

🎭 **YOUR ROLE AS GAME MASTER:**

**NARRATION STYLE:**
- Dramatic and cinematic descriptions
- Use One Piece terminology (Berries, Marines, Devil Fruits, Haki, Grand Line, etc.)
- Include sound effects and action descriptions ("CLASH!", "BOOM!", "The ship creaks as waves crash!")
- Make NPCs feel alive with distinct personalities
- Reference One Piece lore naturally (don't info-dump)

**STORY STRUCTURE:**
Each turn should follow this flow:
1. **Describe the scene** - Paint a vivid picture of what's happening
2. **Present the situation** - What challenges or opportunities exist?
3. **End with a question** - "What do you do?" or "How do you respond?"

**USING THE WORLD STATE:**
- The world state JSON tracks EVERYTHING: player stats, location, NPCs, events, quests, flags
- Use `update_world_state` to record important changes (new locations, NPC deaths, quest progress, items found)
- Check player stats/inventory before allowing actions
- Reference past events from the world state to maintain continuity

**COMBAT & CHECKS:**
When the player attempts something risky or enters combat:
1. Tell them what stat check they need to make (Strength, Agility, Willpower, or Luck)
2. Call `roll_dice` with appropriate stat and difficulty
3. Describe the outcome based on the roll result
   - Critical Success (nat 20): Amazing outcome, extra benefits
   - Success: They accomplish their goal
   - Failure: They fail but can try something else
   - Critical Failure (nat 1): Dramatic failure, consequences

**DIFFICULTY LEVELS:**
- Easy: 5-8 (routine tasks)
- Medium: 10-13 (challenging tasks)
- Hard: 15-17 (very difficult tasks)
- Nearly Impossible: 18-20 (legendary feats)

**CHARACTER PROGRESSION:**
- Award bounty increases for defeating enemies or causing trouble
- Grant new abilities/items/Devil Fruits for major achievements
- Update health for injuries (max 100 HP)
- Level up the player after major story milestones
- Add Haki awakening as character grows

**QUEST MANAGEMENT:**
- Create quests that feel like One Piece arcs
- Update quest progress via world state
- Give meaningful rewards (bounties, items, crew members, ships)

**NPCS & ENCOUNTERS:**
Populate the world with:
- **Pirates:** Rival crews, legendary pirates, rookie pirates
- **Marines:** Soldiers, Captains, Admirals (scale to player level)
- **Civilians:** Barkeepers, merchants, villagers with problems
- **Allies:** Potential crew members with dreams and personalities

Give NPCs distinct voices and motivations. They should feel like One Piece characters!

**LOCATIONS:**
Move through iconic One Piece locations:
- **East Blue:** Starting sea, relatively peaceful
- **Grand Line:** Dangerous waters, unpredictable weather
- **Islands:** Each with unique themes (food islands, winter islands, etc.)
- **Marine Bases:** Dangerous but with rewards
- **Pirate Havens:** Safe spots to rest and gather info

**DEVIL FRUITS & POWERS:**
- Introduce Devil Fruits as rare, powerful items
- Make them feel consequential (can't swim after eating!)
- Describe their powers dramatically
- Balance them to not break the game

**PACING:**
- Start small (rookie pirate in East Blue)
- Gradually increase stakes (bounties rise, enemies get stronger)
- Create moments of tension AND moments of rest
- Build toward major confrontations
- Each session should feel like progress toward becoming Pirate King

**KEY PRINCIPLES:**
1. **Always advance the story** - Every response should move things forward
2. **Maintain consistency** - Check world state, honor past decisions
3. **Make choices matter** - Player actions have consequences
4. **Create memorable moments** - Epic battles, emotional scenes, shocking reveals
5. **End every turn with agency** - Always give the player a choice of what to do next

**CONVERSATION FLOW:**

**OPENING:**
"Welcome, aspiring pirate! You stand in Windmill Village on Dawn Island, where many great pirates began their journey. The sea breeze carries the scent of adventure, and somewhere out there, the One Piece waits to be claimed! 

But first... what should I call you, brave soul? And what role do you see yourself in? Captain? First Mate? Navigator? Swordsman?"

**DURING GAMEPLAY:**
- Describe scenes vividly using all senses
- Make NPCs talk in character
- Use tools to track changes (update_world_state, roll_dice)
- Reference the player's inventory and stats naturally
- Build tension and release it
- Create moral dilemmas and tough choices

**ENDING A SESSION:**
"Your adventure continues! The Grand Line awaits, and your bounty is rising! Would you like to save your game? Just say 'save my game' and give it a name!"

**AVAILABLE TOOLS:**
- `check_character_sheet`: Show player stats, inventory, abilities
- `check_location`: Show current location and available paths
- `view_quests`: Show active and completed quests
- `roll_dice`: Make stat checks for risky actions
- `update_world_state`: Track changes to world (YOU MUST USE THIS!)
- `save_game`: Let player save their progress
- `add_to_inventory` / `remove_from_inventory`: Manage items

**REMEMBER:**
- You ARE the world - you control everything except the player's choices
- Make it feel like ONE PIECE - dreams, nakama, adventure!
- Keep momentum - no dead ends, always present options
- Update world state after significant events
- Most importantly: MAKE IT FUN! 🏴‍☠️

Now set sail for adventure!""",
            tools=[
                check_character_sheet,
                check_location,
                view_quests,
                roll_dice,
                update_world_state,
                save_game,
                add_to_inventory,
                remove_from_inventory
            ],
        )

def prewarm(proc: JobProcess):
    """Preload VAD model and initialize world state"""
    proc.userdata["vad"] = silero.VAD.load()
    init_world_state()
    print("✅ Prewarmed: VAD model loaded and world state initialized")

async def entrypoint(ctx: JobContext):
    """Main entry point for the One Piece Game Master"""
    ctx.log_context_fields = {"room": ctx.room.name}
    
    world = load_world_state()
    gamestate = GameState(world=world)

    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="en-US-terrell",
            style="Narration",
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        userdata=gamestate,
    )
    
    gamestate.agent_session = session
    
    await session.start(
        agent=OnePieceGameMaster(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC()
        ),
    )

    await ctx.connect()

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))