#!/usr/bin/env python3
"""
CLI Interface for Transaction Document Agent
Supports interactive clarification, validation, and PDF generation
"""

import os
import sys
import json
from unittest import result
from invoice_agent import process_user_input
from dotenv import load_dotenv
from normaliser import normalize_document

load_dotenv()


def print_json(data: dict):
    """Pretty print JSON"""
    print(json.dumps(data, indent=2, ensure_ascii=False))


def interactive_mode():
    """Interactive CLI with clarification and PDF support"""
    print("=" * 60)
    print("Transaction Document Agent - Interactive Mode")
    print("=" * 60)
    print("Supports: GST Invoice, Bill of Supply, Quotation, Receipt")
    print("Type 'quit' to exit, 'config' to update business details\n")
    
    conversation_history = []
    
    while True:
        user_input = input("📝 Enter command: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("Goodbye!")
            break
        
        if user_input.lower() == 'config':
            print("\n⚙️  Business Configuration")
            name = input("Business Name (or press Enter to skip): ").strip()
            address = input("Address (or press Enter to skip): ").strip()
            gstin = input("GSTIN (or press Enter to skip): ").strip()
            phone = input("Phone (or press Enter to skip): ").strip()
            
            update_business_config(
                name=name if name else None,
                address=address if address else None,
                gstin=gstin if gstin else None,
                phone=phone if phone else None
            )
            print("✅ Configuration updated!\n")
            continue
            
        if not user_input:
            continue
        
        # Add to conversation history
        conversation_history.append(user_input)
        
        # Process input
        result = process_user_input(user_input)
        
        if "error" in result:
            print("\n❌ Error:")
            print_json(result)
            print()
            continue
        
        if result.get("status") == "needs_clarification":
            print("\n⚠️  Missing Information:")
            print(f"Missing fields: {', '.join(result['missing_fields'])}")
            print("\n🤔 Clarification Questions:")
            for i, q in enumerate(result['clarification_questions'], 1):
                print(f"  {i}. {q}")
            
            print("\n📄 Partial Document Generated:")
            print_json(result['partial_document'])
            
            print("\n💡 Tip: Provide the missing info and try again")
            print()
            
        elif result.get("status") == "complete":
            print("\n✅ Document Generated Successfully!")
            print_json(result['document'])
            
            # Ask if user wants to save JSON
            save_json = input("\n💾 Save JSON to file? (y/n): ").strip().lower()
            if save_json == 'y':
                doc_type = result['document'].get('document_type', 'document')
                doc_number = result['document'].get('invoice_number') or \
                            result['document'].get('bill_number') or \
                            result['document'].get('quotation_number') or \
                            result['document'].get('receipt_number') or 'output'
                
                json_filename = f"{doc_type}_{doc_number}.json".replace('/', '_')
                
                with open(json_filename, 'w', encoding='utf-8') as f:
                    json.dump(result['document'], f, indent=2, ensure_ascii=False)
                
                print(f"✅ JSON saved to: {json_filename}")
            
            # Ask if user wants to generate PDF
            save_pdf = input("📄 Generate PDF? (y/n): ").strip().lower()
            if save_pdf == 'y':
                try:
                    document = normalize_document(result["document"])
                    pdf_path = generate_pdf(document)
                    print(f"✅ PDF generated: {pdf_path}")
                except Exception as e:
                    print(f"❌ PDF generation failed: {str(e)}")
            
            print()


def single_command_mode(command: str, generate_pdf_flag: bool = False):
    """Process single command and output JSON"""
    result = process_user_input(command)
    print_json(result)
    
    # Generate PDF if requested and document is complete
    if generate_pdf_flag and result.get("status") == "complete":
        try:
            document = normalize_document(result["document"])
            pdf_path = generate_pdf(document)
            print(f"\n✅ PDF generated: {pdf_path}", file=sys.stderr)
        except Exception as e:
            print(f"\n❌ PDF generation failed: {str(e)}", file=sys.stderr)


def main():
    """Main CLI entry point"""


    # Check for API key
    if not os.getenv('GEMINI_API_KEY'):
        print(json.dumps({
            "error": "GEMINI_API_KEY not found in environment",
            "help": "Create a .env file with: GEMINI_API_KEY=your_api_key_here"
        }, indent=2))
        sys.exit(1)
    
    # Check for --pdf flag
    generate_pdf_flag = '--pdf' in sys.argv
    if generate_pdf_flag:
        sys.argv.remove('--pdf')
    
    # Check if command provided as argument
    if len(sys.argv) > 1:
        command = ' '.join(sys.argv[1:])
        single_command_mode(command, generate_pdf_flag)
    else:
        # Interactive mode
        interactive_mode()


if __name__ == "__main__":
    main()