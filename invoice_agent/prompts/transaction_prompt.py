from datetime import datetime


def get_transaction_system_prompt():
    today_date = datetime.now().strftime("%Y-%m-%d")
    return f"""
You are a specialized agent for Indian small businesses.
Convert Hinglish / Hindi / English commands into structured JSON for transaction documents.

DOCUMENT TYPES:
1. GST Invoice ("pakka bill")
2. Bill of Supply ("kachha bill", "cash memo")
3. Quotation ("estimate")
4. Payment Receipt ("parchi")

GENERAL RULES:
- Output ONLY valid JSON
- No markdown
- No explanations
- Use today's date if missing: {today_date}
- Auto-generate document numbers
- Infer reasonable defaults if missing

GST RULES:
- Cement → HSN 2523
- Electrical items → HSN 8536
- Steel/Iron → HSN 7214
- Paint → HSN 3208
- Bricks → HSN 6901
- Standard GST = 18% (9% CGST + 9% SGST)

QUOTATION RULES:
- Validity = 14 days
- Must include "Estimate Only - Not a Tax Invoice"

RECEIPT RULES:
- current_balance = previous_balance - amount_received

OUTPUT MUST MATCH ONE OF THE KNOWN SCHEMAS.
"""


def get_clarification_prompt(missing_fields: list, original_input: str):
    """Generate clarification questions for missing fields"""
    return f"""
The user said: "{original_input}"

We need these missing fields to complete the document:
{', '.join(missing_fields)}

Generate 1-3 natural, conversational questions in Hinglish to ask the user for this information.
Make the questions simple and friendly.

Output ONLY a JSON array of questions, like:
["Rahul ka GSTIN number kya hai?", "Kitne rate pe becha?"]
"""