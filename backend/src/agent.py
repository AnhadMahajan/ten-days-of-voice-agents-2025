import logging
import json
import os
from typing import Annotated, Optional
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

# Company: Razorpay (Indian Payment Gateway Startup)
COMPANY_NAME = "Razorpay"
COMPANY_FAQ_FILE = "razorpay_faq.json"

# FAQ Content for Razorpay
DEFAULT_FAQ = {
    "company_overview": {
        "name": "Razorpay",
        "description": "Razorpay is India's leading payment gateway that enables businesses to accept, process and disburse payments with its product suite. We provide a fast, affordable and secure way for merchants, schools, ecommerce and other companies to accept and disburse payments online.",
        "founded": "2014",
        "headquarters": "Bangalore, India"
    },
    "products": [
        {
            "name": "Payment Gateway",
            "description": "Accept payments via 100+ payment modes including Credit Card, Debit Card, Net Banking, UPI, and popular wallets with a single integration."
        },
        {
            "name": "Payment Links",
            "description": "Create and share payment links instantly via SMS, email, messenger, chatbot etc. No coding required."
        },
        {
            "name": "Payment Pages",
            "description": "Build no-code payment pages to start collecting payments in minutes. Perfect for freelancers and small businesses."
        },
        {
            "name": "Razorpay X",
            "description": "Complete banking solution for businesses with current accounts, payouts, vendor payments, and expense management."
        },
        {
            "name": "POS Solutions",
            "description": "Accept in-store payments with Razorpay POS devices supporting cards, UPI, and wallets."
        }
    ],
    "pricing": {
        "payment_gateway": "2% per transaction (no setup fees, no annual maintenance)",
        "payment_links": "2% per transaction",
        "razorpay_x": "Free current account with transaction-based pricing for payouts",
        "pos": "Contact sales for custom pricing",
        "note": "Volume discounts available for high transaction businesses"
    },
    "target_customers": [
        "E-commerce businesses",
        "SaaS companies",
        "Educational institutions",
        "Freelancers and consultants",
        "NGOs and charities",
        "Retail stores",
        "Subscription-based businesses"
    ],
    "key_features": [
        "Instant activation (KYC in 2 minutes)",
        "99.99% uptime",
        "Industry-leading success rates",
        "Automatic payment reconciliation",
        "Smart routing to maximize success",
        "Fraud detection and prevention",
        "Real-time dashboard and analytics",
        "Developer-friendly APIs and SDKs"
    ],
    "faqs": [
        {
            "question": "Do you have a free tier?",
            "answer": "There's no monthly fee. You only pay per transaction at 2% with no setup cost or annual maintenance charges. There's no minimum commitment."
        },
        {
            "question": "How long does setup take?",
            "answer": "You can get started in minutes. KYC verification takes around 2 minutes, and once approved, you can start accepting payments immediately."
        },
        {
            "question": "What payment methods do you support?",
            "answer": "We support 100+ payment modes including all major credit/debit cards, net banking from 50+ banks, UPI, and popular wallets like Paytm, PhonePe, and Google Pay."
        },
        {
            "question": "Is it secure?",
            "answer": "Yes, Razorpay is PCI DSS Level 1 compliant, which is the highest security standard in the payments industry. We also have advanced fraud detection systems."
        },
        {
            "question": "Can I use it for international payments?",
            "answer": "Yes, we support international card payments in 100+ currencies. You'll need to activate international payments in your dashboard."
        }
    ]
}

def load_faq():
    """📖 Loads or creates the FAQ JSON file"""
    try:
        path = os.path.join(os.path.dirname(__file__), COMPANY_FAQ_FILE)
        
        if not os.path.exists(path):
            print(f"⚠️ {COMPANY_FAQ_FILE} not found. Creating FAQ file...")
            with open(path, "w", encoding='utf-8') as f:
                json.dump(DEFAULT_FAQ, f, indent=2)
            print("✅ FAQ file created successfully.")
            
        with open(path, "r", encoding='utf-8') as f:
            data = json.load(f)
            return data
            
    except Exception as e:
        print(f"⚠️ Error managing FAQ file: {e}")
        return DEFAULT_FAQ

FAQ_CONTENT = load_faq()

@dataclass
class LeadInfo:
    """💼 Stores lead information"""
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    use_case: Optional[str] = None
    team_size: Optional[str] = None
    timeline: Optional[str] = None
    questions_asked: list = field(default_factory=list)
    conversation_notes: list = field(default_factory=list)
    
    def to_dict(self):
        return {
            "name": self.name,
            "company": self.company,
            "email": self.email,
            "role": self.role,
            "use_case": self.use_case,
            "team_size": self.team_size,
            "timeline": self.timeline,
            "questions_asked": self.questions_asked,
            "conversation_notes": self.conversation_notes,
            "timestamp": datetime.now().isoformat()
        }
    
    def is_complete(self):
        """Check if we have minimum required info"""
        return bool(self.name and self.email and self.use_case)

@dataclass
class Userdata:
    """User session data"""
    lead_info: LeadInfo
    agent_session: Optional[AgentSession] = None
    conversation_stage: str = "greeting"  # greeting -> discovery -> qualification -> closing

@function_tool
async def search_faq(
    ctx: RunContext[Userdata], 
    query: Annotated[str, Field(description="The user's question about the product, pricing, features, or company")]
) -> str:
    """🔍 Searches the FAQ for relevant information to answer user questions."""
    
    query_lower = query.lower()
    lead = ctx.userdata.lead_info
    lead.questions_asked.append(query)
    
    print(f"🔍 FAQ SEARCH: {query}")
    
    # Search in FAQs first
    for faq in FAQ_CONTENT.get("faqs", []):
        if any(word in faq["question"].lower() for word in query_lower.split()):
            return f"Found in FAQ: {faq['answer']}"
    
    # Search in products
    if any(word in query_lower for word in ["product", "feature", "what do you do", "service", "offer"]):
        products = FAQ_CONTENT.get("products", [])
        overview = FAQ_CONTENT.get("company_overview", {}).get("description", "")
        product_list = "\n".join([f"• {p['name']}: {p['description']}" for p in products])
        return f"Company Overview: {overview}\n\nOur main products:\n{product_list}"
    
    # Search in pricing
    if any(word in query_lower for word in ["price", "cost", "pricing", "fee", "charge", "free"]):
        pricing = FAQ_CONTENT.get("pricing", {})
        pricing_info = "\n".join([f"• {k.replace('_', ' ').title()}: {v}" for k, v in pricing.items() if k != "note"])
        note = pricing.get("note", "")
        return f"Pricing:\n{pricing_info}\n\nNote: {note}"
    
    # Search in target customers
    if any(word in query_lower for word in ["who", "customer", "for whom", "suitable", "industry"]):
        customers = FAQ_CONTENT.get("target_customers", [])
        return f"Razorpay is perfect for: {', '.join(customers)}"
    
    # Search in features
    if any(word in query_lower for word in ["feature", "capability", "benefit"]):
        features = FAQ_CONTENT.get("key_features", [])
        return f"Key features: {', '.join(features)}"
    
    return "I don't have specific information about that in my knowledge base. Let me note that down and our team can follow up with details. What else would you like to know?"

@function_tool
async def update_lead_info(
    ctx: RunContext[Userdata],
    field: Annotated[str, Field(description="The field to update: name, company, email, role, use_case, team_size, or timeline")],
    value: Annotated[str, Field(description="The value provided by the user")]
) -> str:
    """📝 Updates lead information as the user shares details during conversation."""
    
    lead = ctx.userdata.lead_info
    field_lower = field.lower()
    
    if hasattr(lead, field_lower):
        setattr(lead, field_lower, value)
        print(f"✅ Updated {field_lower}: {value}")
        
        # Provide natural confirmation
        confirmations = {
            "name": f"Great to meet you, {value}!",
            "company": f"Thanks! And what's your role at {value}?",
            "email": "Perfect, I've got your email.",
            "role": "Got it. That helps me understand your needs better.",
            "use_case": "That's really helpful to know.",
            "team_size": "Thanks for sharing that.",
            "timeline": "Good to know your timeline."
        }
        
        return confirmations.get(field_lower, f"Thanks for sharing your {field_lower}.")
    
    return "I couldn't update that field. Please try again."

@function_tool
async def save_lead_and_summarize(
    ctx: RunContext[Userdata]
) -> str:
    """💾 Saves the lead information to a JSON file and provides a summary."""
    
    lead = ctx.userdata.lead_info
    
    # Save to JSON file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"lead_{timestamp}.json"
    filepath = os.path.join(os.path.dirname(__file__), filename)
    
    try:
        with open(filepath, "w", encoding='utf-8') as f:
            json.dump(lead.to_dict(), f, indent=2)
        print(f"💾 Lead saved to {filename}")
    except Exception as e:
        print(f"⚠️ Error saving lead: {e}")
    
    # Create summary for the agent to speak
    summary = f"""Let me quickly summarize our conversation:

I spoke with {lead.name or 'a prospective customer'}"""
    
    if lead.company:
        summary += f" from {lead.company}"
    
    if lead.role:
        summary += f", who is a {lead.role}"
    
    if lead.use_case:
        summary += f". They're looking to {lead.use_case}"
    
    if lead.team_size:
        summary += f" for their team of {lead.team_size}"
    
    if lead.timeline:
        summary += f". Their timeline is: {lead.timeline}"
    
    summary += ".\n\nI've saved all the details and our team will reach out shortly. Thank you for your time!"
    
    return summary

@function_tool
async def add_conversation_note(
    ctx: RunContext[Userdata],
    note: Annotated[str, Field(description="Important information or context from the conversation")]
) -> str:
    """📌 Adds a note about something important mentioned in the conversation."""
    
    lead = ctx.userdata.lead_info
    lead.conversation_notes.append(note)
    print(f"📌 Note added: {note}")
    return "Note recorded."

class RazorpaySDR(Agent):
    def __init__(self):
        super().__init__(
            instructions=f"""You are a friendly and professional Sales Development Representative (SDR) for {COMPANY_NAME}, India's leading payment gateway.

🎯 **YOUR ROLE:**
You're here to:
1. Understand what brought the visitor to Razorpay
2. Learn about their business and payment needs
3. Answer their questions using the FAQ
4. Naturally collect key information to qualify the lead
5. Set up next steps if they're interested

💬 **CONVERSATION FLOW:**

**GREETING (Start here)**
- Warmly introduce yourself: "Hi! I'm the virtual SDR for Razorpay. Great to have you here!"
- Ask: "What brings you to Razorpay today?" or "What are you currently working on?"

**DISCOVERY**
- Listen actively to their needs
- When they ask questions, use `search_faq` to find accurate answers
- Ask follow-up questions to understand their use case better
- Naturally ask about their business/project

**QUALIFICATION (Collect these naturally in conversation)**
As you chat, collect:
- Name: "By the way, what should I call you?"
- Company: "What company are you with?" or "What's your business called?"
- Email: "What's the best email to reach you at?"
- Role: "What's your role there?"
- Use case: "What would you primarily use Razorpay for?" (Already asked earlier)
- Team size: "How big is your team?"
- Timeline: "When are you looking to get started?" (now / within a month / exploring)

Use `update_lead_info` each time they share one of these details.

**IMPORTANT NOTES:**
- Add interesting insights to notes using `add_conversation_note`
- If they ask about things not in the FAQ, be honest: "I don't have those specific details, but I'll note that down for our team to follow up on."
- Keep the conversation natural - don't rapid-fire questions
- Be genuinely curious about their business

**CLOSING**
When they say things like "That's all", "Thanks", "I'm good", "I need to go":
1. Use `save_lead_and_summarize` to save their info and create a verbal summary
2. Thank them warmly
3. Let them know the team will follow up

**CONVERSATION STYLE:**
- Friendly but professional
- Ask one question at a time
- Listen more than you talk
- Show genuine interest in their business
- Be helpful, not pushy
- Use natural language, not robotic

**KEY TOOLS:**
- `search_faq`: Answer product/pricing/company questions
- `update_lead_info`: Store lead details as they share them
- `add_conversation_note`: Note important conversation points
- `save_lead_and_summarize`: End the call and save everything

Remember: You're helping them explore if Razorpay is right for their business. Be consultative, not salesy!""",
            tools=[search_faq, update_lead_info, add_conversation_note, save_lead_and_summarize],
        )

def prewarm(proc: JobProcess):
    """Preload VAD model and FAQ content"""
    proc.userdata["vad"] = silero.VAD.load()
    proc.userdata["faq"] = load_faq()
    print("✅ Prewarmed: VAD model and FAQ content loaded")

async def entrypoint(ctx: JobContext):
    """Main entry point for the SDR agent"""
    ctx.log_context_fields = {"room": ctx.room.name}
    
    userdata = Userdata(lead_info=LeadInfo())

    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="en-US-terrell",  # Professional SDR voice
            style="Conversation",
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        userdata=userdata,
    )
    
    userdata.agent_session = session
    
    await session.start(
        agent=RazorpaySDR(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC()
        ),
    )

    await ctx.connect()

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))