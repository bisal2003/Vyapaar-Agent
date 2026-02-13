from invoice_agent import process_user_input
from pdf_generator import generate_pdf
from utils.output_saver import save_document_json

def handle_user_command(user_input: str) -> dict:
    """
    End-to-end document pipeline
    """
    result = process_user_input(user_input)

    if result["status"] != "complete":
        return result

    document = result["document"]

    # 1. Save JSON
    json_path = save_document_json(document)

    # 2. Generate PDF
    pdf_path = generate_pdf(document)

    return {
        "status": "success",
        "document_type": document["document_type"],
        "json_path": json_path,
        "pdf_path": pdf_path,
        "document": document
    }
