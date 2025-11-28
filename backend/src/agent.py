import logging
import json
import os
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

# Store Configuration
STORE_NAME = "QuickMart Express"
CATALOG_FILE = "catalog.json"
ORDERS_DIR = "orders"

# Sample Catalog Data
SAMPLE_CATALOG = {
    "categories": {
        "groceries": [
            {
                "id": "g001",
                "name": "Whole Wheat Bread",
                "category": "groceries",
                "price": 45,
                "brand": "Nature's Own",
                "size": "500g",
                "tags": ["vegan", "healthy"]
            },
            {
                "id": "g002",
                "name": "White Bread",
                "category": "groceries",
                "price": 40,
                "brand": "Britannia",
                "size": "450g",
                "tags": ["vegetarian"]
            },
            {
                "id": "g003",
                "name": "Milk",
                "category": "groceries",
                "price": 60,
                "brand": "Amul",
                "size": "1L",
                "tags": ["dairy", "fresh"]
            },
            {
                "id": "g004",
                "name": "Eggs",
                "category": "groceries",
                "price": 80,
                "brand": "Farm Fresh",
                "size": "12 pack",
                "tags": ["protein", "fresh"]
            },
            {
                "id": "g005",
                "name": "Peanut Butter",
                "category": "groceries",
                "price": 180,
                "brand": "Sundrop",
                "size": "400g",
                "tags": ["protein", "spread"]
            },
            {
                "id": "g006",
                "name": "Pasta",
                "category": "groceries",
                "price": 120,
                "brand": "Del Monte",
                "size": "500g",
                "tags": ["italian", "vegan"]
            },
            {
                "id": "g007",
                "name": "Pasta Sauce",
                "category": "groceries",
                "price": 150,
                "brand": "Maggi",
                "size": "350g",
                "tags": ["italian", "sauce"]
            },
            {
                "id": "g008",
                "name": "Rice",
                "category": "groceries",
                "price": 250,
                "brand": "India Gate",
                "size": "5kg",
                "tags": ["staple", "vegan"]
            },
            {
                "id": "g009",
                "name": "Cheese",
                "category": "groceries",
                "price": 200,
                "brand": "Amul",
                "size": "200g",
                "tags": ["dairy", "cheese"]
            }
        ],
        "snacks": [
            {
                "id": "s001",
                "name": "Potato Chips",
                "category": "snacks",
                "price": 20,
                "brand": "Lays",
                "size": "50g",
                "tags": ["snack", "vegan"]
            },
            {
                "id": "s002",
                "name": "Cookies",
                "category": "snacks",
                "price": 30,
                "brand": "Parle-G",
                "size": "100g",
                "tags": ["snack", "vegetarian"]
            },
            {
                "id": "s003",
                "name": "Chocolate",
                "category": "snacks",
                "price": 40,
                "brand": "Dairy Milk",
                "size": "50g",
                "tags": ["snack", "sweet"]
            },
            {
                "id": "s004",
                "name": "Namkeen Mix",
                "category": "snacks",
                "price": 50,
                "brand": "Haldiram's",
                "size": "200g",
                "tags": ["snack", "spicy", "vegan"]
            }
        ],
        "prepared_food": [
            {
                "id": "p001",
                "name": "Margherita Pizza",
                "category": "prepared_food",
                "price": 250,
                "brand": "QuickMart Kitchen",
                "size": "Medium",
                "tags": ["vegetarian", "italian"]
            },
            {
                "id": "p002",
                "name": "Veggie Sandwich",
                "category": "prepared_food",
                "price": 80,
                "brand": "QuickMart Kitchen",
                "size": "Regular",
                "tags": ["vegetarian", "healthy"]
            },
            {
                "id": "p003",
                "name": "Chicken Biryani",
                "category": "prepared_food",
                "price": 180,
                "brand": "QuickMart Kitchen",
                "size": "1 serving",
                "tags": ["non-vegetarian", "indian"]
            },
            {
                "id": "p004",
                "name": "Paneer Wrap",
                "category": "prepared_food",
                "price": 120,
                "brand": "QuickMart Kitchen",
                "size": "Regular",
                "tags": ["vegetarian", "indian"]
            }
        ],
        "beverages": [
            {
                "id": "b001",
                "name": "Orange Juice",
                "category": "beverages",
                "price": 80,
                "brand": "Tropicana",
                "size": "1L",
                "tags": ["juice", "fresh"]
            },
            {
                "id": "b002",
                "name": "Coke",
                "category": "beverages",
                "price": 40,
                "brand": "Coca-Cola",
                "size": "500ml",
                "tags": ["soft drink", "cold"]
            }
        ]
    },
    "recipes": {
        "peanut butter sandwich": ["g001", "g005"],
        "pb sandwich": ["g001", "g005"],
        "sandwich": ["g002", "g005"],
        "pasta": ["g006", "g007"],
        "pasta for two": ["g006", "g007"],
        "breakfast": ["g002", "g003", "g004"],
        "eggs and toast": ["g002", "g004"],
        "pizza night": ["p001", "b002"]
    }
}

def init_catalog():
    """Initialize catalog JSON file"""
    if not os.path.exists(CATALOG_FILE):
        with open(CATALOG_FILE, 'w') as f:
            json.dump(SAMPLE_CATALOG, f, indent=2)
        print(f"✅ Catalog created: {CATALOG_FILE}")
    else:
        print(f"✅ Catalog already exists: {CATALOG_FILE}")
    
    # Create orders directory
    if not os.path.exists(ORDERS_DIR):
        os.makedirs(ORDERS_DIR)
        print(f"✅ Orders directory created: {ORDERS_DIR}")

def load_catalog():
    """Load catalog from JSON file"""
    with open(CATALOG_FILE, 'r') as f:
        return json.load(f)

@dataclass
class CartItem:
    """Represents an item in the shopping cart"""
    item_id: str
    name: str
    price: float
    quantity: int
    brand: str
    size: str
    notes: str = ""

@dataclass
class ShoppingCart:
    """Shopping cart state"""
    items: List[CartItem] = field(default_factory=list)
    customer_name: Optional[str] = None
    customer_address: Optional[str] = None

@dataclass
class Userdata:
    """User session data"""
    cart: ShoppingCart
    catalog: Dict
    agent_session: Optional[AgentSession] = None

@function_tool
async def search_items(
    ctx: RunContext[Userdata],
    search_term: Annotated[str, Field(description="Item name, category, or tag to search for")]
) -> str:
    """🔍 Search for items in the catalog by name, category, or tags."""
    
    catalog = ctx.userdata.catalog
    search_term_lower = search_term.lower()
    results = []
    
    # Search through all categories
    for category, items in catalog["categories"].items():
        for item in items:
            # Check if search term matches name, category, or tags
            if (search_term_lower in item["name"].lower() or 
                search_term_lower in item["category"].lower() or
                any(search_term_lower in tag.lower() for tag in item.get("tags", []))):
                results.append(item)
    
    if not results:
        return f"Sorry, I couldn't find any items matching '{search_term}'. Could you try a different search term?"
    
    # Format results
    response = f"I found {len(results)} item(s) matching '{search_term}':\n\n"
    for item in results[:5]:  # Limit to 5 results
        response += f"- {item['name']} ({item['brand']}, {item['size']}) - ₹{item['price']}\n"
    
    if len(results) > 5:
        response += f"\n...and {len(results) - 5} more items. Would you like to see more?"
    
    return response

@function_tool
async def add_to_cart(
    ctx: RunContext[Userdata],
    item_name: Annotated[str, Field(description="Name of the item to add")],
    quantity: Annotated[int, Field(description="Quantity of the item", default=1)] = 1,
    notes: Annotated[Optional[str], Field(description="Optional notes like 'whole wheat' or 'large size'", default="")] = ""
) -> str:
    """🛒 Add an item to the shopping cart."""
    
    catalog = ctx.userdata.catalog
    cart = ctx.userdata.cart
    item_name_lower = item_name.lower()
    
    # Search for the item
    found_item = None
    for category, items in catalog["categories"].items():
        for item in items:
            if item_name_lower in item["name"].lower():
                # If notes specify preference, try to match
                if notes:
                    if notes.lower() in item["name"].lower() or notes.lower() in item.get("brand", "").lower():
                        found_item = item
                        break
                # Otherwise take first match
                if not found_item:
                    found_item = item
        if found_item:
            break
    
    if not found_item:
        return f"Sorry, I couldn't find '{item_name}' in our catalog. Would you like me to search for similar items?"
    
    # Check if item already in cart
    for cart_item in cart.items:
        if cart_item.item_id == found_item["id"]:
            cart_item.quantity += quantity
            return f"Updated! {found_item['name']} quantity is now {cart_item.quantity} in your cart. (₹{found_item['price']} each)"
    
    # Add new item to cart
    cart_item = CartItem(
        item_id=found_item["id"],
        name=found_item["name"],
        price=found_item["price"],
        quantity=quantity,
        brand=found_item["brand"],
        size=found_item["size"],
        notes=notes or ""
    )
    cart.items.append(cart_item)
    
    return f"Added {quantity} x {found_item['name']} ({found_item['brand']}, {found_item['size']}) to your cart at ₹{found_item['price']} each."

@function_tool
async def add_recipe_ingredients(
    ctx: RunContext[Userdata],
    recipe_name: Annotated[str, Field(description="Name of the recipe/dish (e.g., 'peanut butter sandwich', 'pasta')")]
) -> str:
    """🍳 Add all ingredients needed for a specific recipe or meal."""
    
    catalog = ctx.userdata.catalog
    cart = ctx.userdata.cart
    recipe_name_lower = recipe_name.lower()
    
    # Find matching recipe
    recipe_items = None
    matched_recipe = None
    for recipe, item_ids in catalog["recipes"].items():
        if recipe_name_lower in recipe or recipe in recipe_name_lower:
            recipe_items = item_ids
            matched_recipe = recipe
            break
    
    if not recipe_items:
        return f"I don't have a preset recipe for '{recipe_name}'. Would you like me to search for individual items instead?"
    
    # Get all items for the recipe
    added_items = []
    for item_id in recipe_items:
        for category, items in catalog["categories"].items():
            for item in items:
                if item["id"] == item_id:
                    # Check if already in cart
                    found_in_cart = False
                    for cart_item in cart.items:
                        if cart_item.item_id == item_id:
                            cart_item.quantity += 1
                            found_in_cart = True
                            break
                    
                    if not found_in_cart:
                        cart_item = CartItem(
                            item_id=item["id"],
                            name=item["name"],
                            price=item["price"],
                            quantity=1,
                            brand=item["brand"],
                            size=item["size"],
                            notes=f"For {matched_recipe}"
                        )
                        cart.items.append(cart_item)
                    
                    added_items.append(item["name"])
                    break
    
    if added_items:
        items_list = ", ".join(added_items)
        return f"Perfect! I've added ingredients for {matched_recipe}: {items_list}. Anything else you need?"
    else:
        return "There was an issue adding the ingredients. Please try again."

@function_tool
async def view_cart(
    ctx: RunContext[Userdata]
) -> str:
    """👀 View all items currently in the shopping cart."""
    
    cart = ctx.userdata.cart
    
    if not cart.items:
        return "Your cart is empty. What would you like to order today?"
    
    response = f"Here's what's in your cart:\n\n"
    total = 0.0
    
    for idx, item in enumerate(cart.items, 1):
        item_total = item.price * item.quantity
        total += item_total
        response += f"{idx}. {item.name} ({item.brand})\n"
        response += f"   Quantity: {item.quantity} x ₹{item.price} = ₹{item_total}\n"
        if item.notes:
            response += f"   Note: {item.notes}\n"
    
    response += f"\nTotal: ₹{total:.2f}"
    return response

@function_tool
async def remove_from_cart(
    ctx: RunContext[Userdata],
    item_name: Annotated[str, Field(description="Name of the item to remove")]
) -> str:
    """❌ Remove an item from the shopping cart."""
    
    cart = ctx.userdata.cart
    item_name_lower = item_name.lower()
    
    for idx, cart_item in enumerate(cart.items):
        if item_name_lower in cart_item.name.lower():
            removed_item = cart.items.pop(idx)
            return f"Removed {removed_item.name} from your cart."
    
    return f"I couldn't find '{item_name}' in your cart. Would you like to see what's in your cart?"

@function_tool
async def update_quantity(
    ctx: RunContext[Userdata],
    item_name: Annotated[str, Field(description="Name of the item to update")],
    new_quantity: Annotated[int, Field(description="New quantity for the item")]
) -> str:
    """📝 Update the quantity of an item in the cart."""
    
    cart = ctx.userdata.cart
    item_name_lower = item_name.lower()
    
    if new_quantity <= 0:
        return await remove_from_cart(ctx, item_name)
    
    for cart_item in cart.items:
        if item_name_lower in cart_item.name.lower():
            old_quantity = cart_item.quantity
            cart_item.quantity = new_quantity
            return f"Updated {cart_item.name} quantity from {old_quantity} to {new_quantity}."
    
    return f"I couldn't find '{item_name}' in your cart."

@function_tool
async def clear_cart(
    ctx: RunContext[Userdata]
) -> str:
    """🗑️ Clear all items from the shopping cart."""
    
    cart = ctx.userdata.cart
    
    if not cart.items:
        return "Your cart is already empty."
    
    item_count = len(cart.items)
    cart.items = []
    
    return f"Cart cleared! Removed {item_count} item(s)."

@function_tool
async def place_order(
    ctx: RunContext[Userdata],
    customer_name: Annotated[str, Field(description="Customer's name")],
    delivery_address: Annotated[str, Field(description="Delivery address")]
) -> str:
    """✅ Place the order and save it to a JSON file."""
    
    cart = ctx.userdata.cart
    
    if not cart.items:
        return "Your cart is empty! Please add some items before placing an order."
    
    # Calculate total
    total = sum(item.price * item.quantity for item in cart.items)
    
    # Create order object
    order = {
        "order_id": f"ORD{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "timestamp": datetime.now().isoformat(),
        "customer": {
            "name": customer_name,
            "address": delivery_address
        },
        "items": [
            {
                "item_id": item.item_id,
                "name": item.name,
                "brand": item.brand,
                "size": item.size,
                "quantity": item.quantity,
                "price_per_unit": item.price,
                "total_price": item.price * item.quantity,
                "notes": item.notes
            }
            for item in cart.items
        ],
        "total_amount": total,
        "status": "placed"
    }
    
    # Save to JSON file
    order_filename = f"{ORDERS_DIR}/order_{order['order_id']}.json"
    with open(order_filename, 'w') as f:
        json.dump(order, f, indent=2)
    
    # Clear cart
    cart.items = []
    cart.customer_name = customer_name
    cart.customer_address = delivery_address
    
    response = f"""🎉 Order placed successfully!

Order ID: {order['order_id']}
Customer: {customer_name}
Delivery Address: {delivery_address}
Total Amount: ₹{total:.2f}

Your order has been saved and will be delivered soon!
Thank you for shopping with {STORE_NAME}!"""
    
    print(f"✅ Order saved: {order_filename}")
    return response

class GroceryAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions=f"""You are a friendly and helpful voice shopping assistant for {STORE_NAME}, 
a quick commerce grocery and food delivery service.

🎯 **YOUR ROLE:**
Help customers order groceries, snacks, prepared foods, and beverages through natural conversation.

💬 **CONVERSATION FLOW:**

**STAGE 1: GREETING**
Warmly greet the customer:
"Hi! Welcome to {STORE_NAME}! I'm your shopping assistant. I can help you order groceries, 
snacks, prepared meals, and beverages. What would you like to order today?"

**STAGE 2: TAKING ORDERS**
- Listen to what the customer wants
- Use `search_items` if they ask what's available
- Use `add_to_cart` for specific items they request
- Use `add_recipe_ingredients` when they ask for "ingredients for X" or "what I need for Y"
- Always confirm what you're adding: "I've added 2 loaves of bread to your cart"
- Ask clarifying questions when needed: "Would you like whole wheat or white bread?"

**STAGE 3: CART MANAGEMENT**
- Use `view_cart` when they ask "what's in my cart?"
- Use `remove_from_cart` if they want to remove items
- Use `update_quantity` if they want to change quantities
- Use `clear_cart` if they want to start over
- Proactively mention the running total occasionally

**STAGE 4: CHECKOUT**
When they say things like:
- "That's all"
- "I'm done"
- "Place my order"
- "Checkout"

Ask for:
1. Their name (if not already provided)
2. Delivery address

Then use `place_order` with this information.

**STAGE 5: ORDER CONFIRMATION**
After placing the order:
- Confirm the order ID and total
- Ask if they need anything else
- Thank them warmly

**CONVERSATION STYLE:**
- Friendly and conversational (like talking to a helpful store employee)
- Proactive: suggest items, ask if they need anything else
- Patient: handle changes and questions gracefully
- Clear: always confirm actions ("I've added...", "Your cart now has...")
- Natural: avoid robotic responses
- Handle errors gracefully: if something goes wrong, apologize and offer alternatives

**HANDLING SPECIAL REQUESTS:**
- "Ingredients for pasta" → Use `add_recipe_ingredients` with "pasta"
- "What I need for a sandwich" → Use `add_recipe_ingredients` with "sandwich"
- "Show me snacks" → Use `search_items` with "snacks"
- "What vegetables do you have?" → Use `search_items`

**KEY PRINCIPLES:**
1. Always confirm additions to cart
2. Mention prices naturally
3. Keep track of running total
4. Be helpful but not pushy
5. Handle recipe requests intelligently
6. If a tool call fails, acknowledge it and offer alternatives

**AVAILABLE TOOLS:**
- `search_items`: Search the catalog
- `add_to_cart`: Add individual items
- `add_recipe_ingredients`: Add preset recipe ingredients
- `view_cart`: Show cart contents
- `remove_from_cart`: Remove items
- `update_quantity`: Change quantities
- `clear_cart`: Empty the cart
- `place_order`: Checkout and save order

Remember: You're here to make grocery shopping easy and enjoyable!""",
            tools=[search_items, add_to_cart, add_recipe_ingredients, view_cart, 
                   remove_from_cart, update_quantity, clear_cart, place_order],
        )

def prewarm(proc: JobProcess):
    """Preload VAD model and initialize catalog"""
    proc.userdata["vad"] = silero.VAD.load()
    init_catalog()
    print("✅ Prewarmed: VAD model loaded and catalog initialized")

async def entrypoint(ctx: JobContext):
    """Main entry point for the grocery ordering agent"""
    ctx.log_context_fields = {"room": ctx.room.name}
    
    catalog = load_catalog()
    userdata = Userdata(
        cart=ShoppingCart(),
        catalog=catalog
    )

    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="en-US-terrell",
            style="Conversation",
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        userdata=userdata,
    )
    
    userdata.agent_session = session
    
    await session.start(
        agent=GroceryAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC()
        ),
    )

    await ctx.connect()

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))