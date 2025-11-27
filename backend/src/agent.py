import logging
import sqlite3
import os
from typing import Annotated, Optional
from dataclasses import dataclass
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

# Bank Configuration
BANK_NAME = "SecureBank India"
DATABASE_FILE = "fraud_cases.db"

# Sample Fraud Cases Data
SAMPLE_FRAUD_CASES = [
    {
        "userName": "luffy",
        "securityIdentifier": "12345",
        "cardEnding": "4242",
        "case": "pending_review",
        "transactionAmount": "₹45,999",
        "transactionName": "ABC Electronics Ltd",
        "transactionTime": "2025-11-27 14:23:15",
        "transactionCategory": "e-commerce",
        "transactionSource": "alibaba.com",
        "transactionLocation": "Shenzhen, China",
        "securityQuestion": "What is your mother's maiden name?",
        "securityAnswer": "mahajan",
        "outcomeNote": ""
    },
    {
        "userName": "Priya Patel",
        "securityIdentifier": "67890",
        "cardEnding": "8888",
        "case": "pending_review",
        "transactionAmount": "₹1,25,000",
        "transactionName": "Luxury Fashion Store",
        "transactionTime": "2025-11-27 03:15:42",
        "transactionCategory": "retail",
        "transactionSource": "fashionlux.net",
        "transactionLocation": "Dubai, UAE",
        "securityQuestion": "What city were you born in?",
        "securityAnswer": "Mumbai",
        "outcomeNote": ""
    },
    {
        "userName": "Amit Verma",
        "securityIdentifier": "54321",
        "cardEnding": "7777",
        "case": "pending_review",
        "transactionAmount": "₹89,500",
        "transactionName": "Tech Gadgets International",
        "transactionTime": "2025-11-27 09:45:20",
        "transactionCategory": "e-commerce",
        "transactionSource": "techgadgets.co",
        "transactionLocation": "Singapore",
        "securityQuestion": "What is your favorite color?",
        "securityAnswer": "Blue",
        "outcomeNote": ""
    }
]

def init_database():
    """🗄️ Initialize SQLite database with fraud cases table"""
    db_path = os.path.join(os.path.dirname(__file__), DATABASE_FILE)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create fraud_cases table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fraud_cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userName TEXT NOT NULL,
            securityIdentifier TEXT NOT NULL,
            cardEnding TEXT NOT NULL,
            caseStatus TEXT NOT NULL,
            transactionAmount TEXT NOT NULL,
            transactionName TEXT NOT NULL,
            transactionTime TEXT NOT NULL,
            transactionCategory TEXT NOT NULL,
            transactionSource TEXT NOT NULL,
            transactionLocation TEXT NOT NULL,
            securityQuestion TEXT NOT NULL,
            securityAnswer TEXT NOT NULL,
            outcomeNote TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Check if table is empty
    cursor.execute("SELECT COUNT(*) FROM fraud_cases")
    count = cursor.fetchone()[0]
    
    if count == 0:
        print("📊 Populating database with sample fraud cases...")
        for case in SAMPLE_FRAUD_CASES:
            cursor.execute("""
                INSERT INTO fraud_cases 
                (userName, securityIdentifier, cardEnding, caseStatus, transactionAmount, 
                 transactionName, transactionTime, transactionCategory, transactionSource, 
                 transactionLocation, securityQuestion, securityAnswer, outcomeNote)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                case["userName"],
                case["securityIdentifier"],
                case["cardEnding"],
                case["case"],
                case["transactionAmount"],
                case["transactionName"],
                case["transactionTime"],
                case["transactionCategory"],
                case["transactionSource"],
                case["transactionLocation"],
                case["securityQuestion"],
                case["securityAnswer"],
                case["outcomeNote"]
            ))
        conn.commit()
        print("✅ Sample fraud cases inserted successfully")
    
    conn.close()
    print(f"✅ Database initialized: {db_path}")
    return db_path

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(__file__), DATABASE_FILE)
    return sqlite3.connect(db_path)

@dataclass
class FraudCaseData:
    """🚨 Stores current fraud case information"""
    id: Optional[int] = None
    userName: Optional[str] = None
    securityIdentifier: Optional[str] = None
    cardEnding: Optional[str] = None
    case: Optional[str] = None
    transactionAmount: Optional[str] = None
    transactionName: Optional[str] = None
    transactionTime: Optional[str] = None
    transactionCategory: Optional[str] = None
    transactionSource: Optional[str] = None
    transactionLocation: Optional[str] = None
    securityQuestion: Optional[str] = None
    securityAnswer: Optional[str] = None
    outcomeNote: Optional[str] = None
    verification_passed: bool = False
    case_loaded: bool = False

@dataclass
class Userdata:
    """User session data"""
    fraud_case: FraudCaseData
    agent_session: Optional[AgentSession] = None
    conversation_stage: str = "greeting"

@function_tool
async def load_fraud_case_for_user(
    ctx: RunContext[Userdata],
    user_name: Annotated[str, Field(description="The name provided by the user")]
) -> str:
    """🔍 Loads the fraud case for the specified user from the database."""
    
    fraud_case = ctx.userdata.fraud_case
    print(f"🔍 LOADING FRAUD CASE FOR: {user_name}")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Search for user (case-insensitive)
        cursor.execute("""
            SELECT id, userName, securityIdentifier, cardEnding, caseStatus, 
                   transactionAmount, transactionName, transactionTime, 
                   transactionCategory, transactionSource, transactionLocation, 
                   securityQuestion, securityAnswer, outcomeNote
            FROM fraud_cases 
            WHERE LOWER(userName) = LOWER(?)
            AND caseStatus = 'pending_review'
            LIMIT 1
        """, (user_name,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            # Load all fields into fraud_case
            fraud_case.id = row[0]
            fraud_case.userName = row[1]
            fraud_case.securityIdentifier = row[2]
            fraud_case.cardEnding = row[3]
            fraud_case.case = row[4]
            fraud_case.transactionAmount = row[5]
            fraud_case.transactionName = row[6]
            fraud_case.transactionTime = row[7]
            fraud_case.transactionCategory = row[8]
            fraud_case.transactionSource = row[9]
            fraud_case.transactionLocation = row[10]
            fraud_case.securityQuestion = row[11]
            fraud_case.securityAnswer = row[12]
            fraud_case.outcomeNote = row[13] or ""
            fraud_case.case_loaded = True
            
            print(f"✅ Fraud case loaded for {fraud_case.userName} (ID: {fraud_case.id})")
            return f"Case loaded successfully for {fraud_case.userName}. Card ending in {fraud_case.cardEnding}."
        else:
            print(f"❌ No pending fraud case found for: {user_name}")
            return f"I'm sorry, I don't have any pending fraud alerts for the name {user_name}. Could you please verify the name?"
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        return "I'm experiencing a technical issue accessing your case. Please try again."

@function_tool
async def verify_customer_identity(
    ctx: RunContext[Userdata],
    security_answer: Annotated[str, Field(description="The answer provided by the user to the security question")]
) -> str:
    """🔐 Verifies the customer's identity using their security answer."""
    
    fraud_case = ctx.userdata.fraud_case
    
    if not fraud_case.case_loaded:
        return "I need to load your case first. Can you please provide your name?"
    
    print(f"🔐 VERIFYING IDENTITY: Provided answer: {security_answer}")
    
    # Check if answer matches (case-insensitive)
    if security_answer.lower().strip() == fraud_case.securityAnswer.lower().strip():
        fraud_case.verification_passed = True
        print("✅ Verification PASSED")
        return "Thank you for verifying your identity. I can now proceed with discussing the suspicious transaction."
    else:
        fraud_case.verification_passed = False
        print("❌ Verification FAILED")
        return "I'm sorry, but that answer doesn't match our records. For your security, I cannot proceed with this call. Please contact our customer service number for assistance."

@function_tool
async def mark_transaction_status(
    ctx: RunContext[Userdata],
    user_confirmed: Annotated[bool, Field(description="True if user confirmed they made the transaction, False if they deny it")],
    additional_notes: Annotated[str, Field(description="Any additional context or notes from the conversation")] = ""
) -> str:
    """✅ Marks the fraud case as safe or fraudulent based on customer response."""
    
    fraud_case = ctx.userdata.fraud_case
    
    if not fraud_case.verification_passed:
        return "I cannot update the case status without proper verification."
    
    if not fraud_case.id:
        return "Case ID not found. Cannot update status."
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if user_confirmed:
            new_status = "confirmed_safe"
            outcome_note = f"Customer confirmed the transaction as legitimate. {additional_notes}".strip()
            
            cursor.execute("""
                UPDATE fraud_cases 
                SET caseStatus = ?, outcomeNote = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (new_status, outcome_note, fraud_case.id))
            
            conn.commit()
            conn.close()
            
            fraud_case.case = new_status
            fraud_case.outcomeNote = outcome_note
            
            print(f"✅ Case ID {fraud_case.id} marked as SAFE for {fraud_case.userName}")
            
            return f"""Perfect! I've marked this transaction as legitimate in our system. 

Your card ending in {fraud_case.cardEnding} is active and secure. No further action is needed.

Thank you for confirming, {fraud_case.userName}. Is there anything else I can help you with?"""
        
        else:
            new_status = "confirmed_fraud"
            outcome_note = f"Customer denied making the transaction. Fraud confirmed. {additional_notes}".strip()
            
            cursor.execute("""
                UPDATE fraud_cases 
                SET caseStatus = ?, outcomeNote = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (new_status, outcome_note, fraud_case.id))
            
            conn.commit()
            conn.close()
            
            fraud_case.case = new_status
            fraud_case.outcomeNote = outcome_note
            
            print(f"🚨 Case ID {fraud_case.id} marked as FRAUDULENT for {fraud_case.userName}")
            
            return f"""I understand. I'm immediately taking the following actions to protect your account:

1. Your card ending in {fraud_case.cardEnding} has been blocked to prevent further unauthorized transactions.
2. A fraud dispute has been raised for the amount of {fraud_case.transactionAmount}.
3. We'll investigate this transaction and you will not be held liable for this fraudulent charge.
4. A new card will be sent to your registered address within 5-7 business days.

You'll receive a confirmation email shortly with all the details and a reference number for your dispute.

Is there anything else you'd like to know about this process, {fraud_case.userName}?"""
    
    except Exception as e:
        print(f"❌ Database error during update: {e}")
        return "There was an error updating the case. Please contact customer service."

@function_tool
async def end_fraud_call(
    ctx: RunContext[Userdata]
) -> str:
    """📞 Ends the fraud alert call and provides a summary."""
    
    fraud_case = ctx.userdata.fraud_case
    
    summary = f"""Thank you for your time today, {fraud_case.userName or 'valued customer'}. 

Let me quickly summarize our call:
- We discussed a suspicious transaction of {fraud_case.transactionAmount} at {fraud_case.transactionName}
- Case status: {fraud_case.case}
- Action taken: {fraud_case.outcomeNote}

Your security is our top priority at {BANK_NAME}. If you have any concerns or questions, please don't hesitate to call our 24/7 customer service line.

Have a great day and stay safe!"""
    
    print(f"📞 Call ended for {fraud_case.userName}")
    return summary

class FraudAlertAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions=f"""You are a professional and calm Fraud Alert Representative from {BANK_NAME}'s Fraud Detection Department.

🎯 **YOUR ROLE:**
You are calling customers about suspicious transactions on their accounts. Your goal is to:
1. Verify the customer's identity safely
2. Inform them about the suspicious transaction
3. Determine if the transaction is legitimate or fraudulent
4. Take appropriate action to protect their account

⚠️ **CRITICAL SECURITY RULES:**
- NEVER ask for full card numbers, PINs, passwords, or CVV
- NEVER ask for OTPs or authentication codes
- Only use the security question stored in the database for verification
- Always maintain a calm, professional, and reassuring tone

💬 **CONVERSATION FLOW:**

**STAGE 1: GREETING & INTRODUCTION**
Start with:
"Hello, this is the Fraud Detection Department calling from {BANK_NAME}. We've detected some unusual activity on one of our customer accounts and I need to speak with the account holder to verify a transaction. 

May I know whom I'm speaking with?"

**STAGE 2: LOAD CASE**
Once they provide their name, use `load_fraud_case_for_user` to load their fraud case.

If case found:
"Thank you, [Name]. I have your account information here. Before I can discuss the details, I need to verify your identity for security purposes."

If case not found:
"I apologize, but I don't see any fraud alerts under that name. Could you please verify the spelling of your name?"

**STAGE 3: IDENTITY VERIFICATION**
Ask the security question from the loaded case:
"For verification purposes, can you please answer this security question: [security_question]"

Use `verify_customer_identity` with their answer.

If verification PASSES:
- Proceed to disclose the transaction
If verification FAILS:
- Politely end the call: "For your security, I cannot proceed without proper verification. Please visit your nearest branch or call our customer service line. Thank you."

**STAGE 4: TRANSACTION DISCLOSURE**
Present the suspicious transaction clearly:
"Thank you for verifying your identity. I'm calling because we detected a suspicious transaction on your card ending in [card_ending].

Here are the details:
- Amount: [transaction_amount]
- Merchant: [transaction_name]
- Location: [transaction_location]
- Date & Time: [transaction_time]
- Source: [transaction_source]

This transaction was flagged because [mention reason - unusual location/amount/time/merchant].

My question for you is: Did you authorize or make this transaction?"

**STAGE 5: RESOLUTION**
Listen carefully to their response:

If they say YES (they made the transaction):
- Use `mark_transaction_status` with user_confirmed=True
- Reassure them their card is safe
- Ask if they have any questions

If they say NO (they didn't make it):
- Express concern and support
- Use `mark_transaction_status` with user_confirmed=False
- Explain the protective actions being taken
- Provide next steps

**STAGE 6: CLOSING**
- Ask if they have any other questions
- When they're ready to end, use `end_fraud_call` to summarize
- Thank them professionally

**CONVERSATION STYLE:**
- Calm and reassuring (fraud situations can be stressful)
- Professional but empathetic
- Clear and concise
- Patient with their questions
- Never pushy or aggressive
- Use phrases like "for your security", "to protect your account"

**HANDLING EDGE CASES:**
- If they're confused: Patiently re-explain
- If they're angry: Stay calm, empathize, focus on helping
- If they want to speak to a human: Acknowledge and assure them this is handled by the fraud team
- If they ask about other transactions: Focus on the flagged transaction first

**KEY TOOLS:**
- `load_fraud_case_for_user`: Load the fraud case by name
- `verify_customer_identity`: Verify using security answer
- `mark_transaction_status`: Mark as safe or fraudulent
- `end_fraud_call`: Summarize and close the call

Remember: Your primary goal is to protect the customer's account while providing excellent service during a potentially stressful situation.""",
            tools=[load_fraud_case_for_user, verify_customer_identity, mark_transaction_status, end_fraud_call],
        )

def prewarm(proc: JobProcess):
    """Preload VAD model and initialize database"""
    proc.userdata["vad"] = silero.VAD.load()
    init_database()
    print("✅ Prewarmed: VAD model loaded and database initialized")

async def entrypoint(ctx: JobContext):
    """Main entry point for the fraud alert agent"""
    ctx.log_context_fields = {"room": ctx.room.name}
    
    userdata = Userdata(fraud_case=FraudCaseData())

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
        agent=FraudAlertAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC()
        ),
    )

    await ctx.connect()

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))