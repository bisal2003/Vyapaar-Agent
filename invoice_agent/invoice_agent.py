"""
Core Agent Logic for Transaction Document Generation
"""

import os
import json
from typing import Tuple, Optional
from dotenv import load_dotenv
from google import genai
from datetime import datetime

from prompts.transaction_prompt import get_transaction_system_prompt, get_clarification_prompt

# Load environment variables
load_dotenv()

# Initialize Gemini client
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))


def validate_document(doc: dict) -> Tuple[bool, list]:
    """
    Validates extracted document JSON.
    Returns:
      is_valid (bool)
      missing_fields (list)
    """
    missing = []
    doc_type = doc.get("document_type")

    if not doc_type:
        missing.append("document_type")
        return False, missing

    if doc_type == "gst_invoice":
        if not doc.get("customer_name"):
            missing.append("customer_name")

        items = doc.get("items", [])
        if not items:
            missing.append("items")
        else:
            for i, item in enumerate(items):
                if not item.get("hsn_code"):
                    missing.append(f"items[{i}].hsn_code")
                if not item.get("rate"):
                    missing.append(f"items[{i}].rate")
                if not item.get("quantity"):
                    missing.append(f"items[{i}].quantity")

    elif doc_type == "bill_of_supply":
        if not doc.get("items"):
            missing.append("items")
        if not doc.get("total"):
            missing.append("total")

    elif doc_type == "quotation":
        if not doc.get("items"):
            missing.append("items")
        else:
            for i, item in enumerate(doc["items"]):
                if not item.get("rate") and not item.get("amount"):
                    missing.append(f"items[{i}].rate_or_amount")

    elif doc_type == "payment_receipt":
        if not doc.get("amount_received"):
            missing.append("amount_received")
        if not doc.get("payment_mode"):
            missing.append("payment_mode")
        if doc.get("payment_for") and "udhaar" in doc.get("payment_for", "").lower():
            if "previous_balance" not in doc:
                missing.append("previous_balance")

    return len(missing) == 0, missing
def save_document_json(document: dict, base_dir: str = "outputs/json") -> str:
    """
    Saves the document JSON to disk in a structured folder.
    
    Returns:
        Path to saved JSON file
    """
    doc_type = document.get("document_type", "unknown")

    # Create directory: outputs/json/<doc_type>/
    save_dir = os.path.join(base_dir, doc_type)
    os.makedirs(save_dir, exist_ok=True)

    # Filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{doc_type}_{timestamp}.json"
    file_path = os.path.join(save_dir, filename)

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(document, f, indent=2, ensure_ascii=False)

    return file_path

def generate_document_json(user_input: str) -> dict:
    """
    Converts natural language input to structured JSON for transaction documents
    
    Args:
        user_input: Natural language command (Hinglish/English)
        
    Returns:
        Dictionary with document data
    """
    try:
        # Get system prompt
        system_prompt = get_transaction_system_prompt()
        
        # Call Gemini API
        response = client.models.generate_content(
            model=os.getenv('MODEL_NAME', 'gemini-2.5-flash'),
            contents=user_input,
            config={
                # CRITICAL: Wrap in float() because .env values are strings
                'temperature': float(os.getenv('MODEL_TEMPERATURE', 0.3)),
                
                # Optional: Control response length
                'max_output_tokens': int(os.getenv('MODEL_MAX_TOKENS', 1000)),
                
                'system_instruction': system_prompt
            }
        )
        
        # Extract the response text
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            lines = response_text.split('\n')
            response_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else response_text
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        # Parse JSON
        document_data = json.loads(response_text)
        
        return document_data
        
    except json.JSONDecodeError as e:
        return {
            "error": "Failed to parse JSON response",
            "details": str(e),
            "raw_response": response_text[:500] if 'response_text' in locals() else "No response"
        }
    except Exception as e:
        return {
            "error": "Failed to generate document",
            "details": str(e)
        }


def generate_clarification_questions(missing_fields: list, original_input: str) -> list:
    """
    Generates natural clarification questions for missing fields
    
    Args:
        missing_fields: List of missing field names
        original_input: Original user input
        
    Returns:
        List of clarification questions
    """
    try:
        clarification_prompt = get_clarification_prompt(missing_fields, original_input)
        
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=clarification_prompt,
            config={
                'temperature': 0.7
            }
        )
        
        response_text = response.text.strip()
        
        # Remove markdown if present
        if response_text.startswith('```'):
            lines = response_text.split('\n')
            response_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else response_text
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        questions = json.loads(response_text)
        return questions if isinstance(questions, list) else [questions]
        
    except Exception as e:
        # Fallback to simple questions
        return [f"Please provide: {field}" for field in missing_fields[:3]]


def process_user_input(user_input: str, conversation_context: Optional[dict] = None) -> dict:
    """
    Main processing function with validation and clarification
    
    Args:
        user_input: User's natural language input
        conversation_context: Optional context from previous clarifications
        
    Returns:
        Dictionary with document data or clarification questions
    """
    # Generate initial document
    document = generate_document_json(user_input)
    
    # Check for errors
    if "error" in document:
        return document
    
    # Validate document
    is_valid, missing_fields = validate_document(document)
    
    if is_valid:
        json_path = save_document_json(document)

        return {
            "status": "complete",
            "document": document,
            "json_path": json_path
        }

    else:
        # Generate clarification questions
        questions = generate_clarification_questions(missing_fields, user_input)
        
        return {
            "status": "needs_clarification",
            "missing_fields": missing_fields,
            "clarification_questions": questions,
            "partial_document": document
        }
    

