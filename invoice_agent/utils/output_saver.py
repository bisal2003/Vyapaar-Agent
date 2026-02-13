from pathlib import Path
import json

BASE_OUTPUT_DIR = Path("outputs")

def save_document_json(doc: dict) -> str:
    """
    Saves document JSON to disk.
    Returns path to saved JSON file.
    """
    doc_type = doc["document_type"]

    doc_number = (
        doc.get("invoice_number")
        or doc.get("bill_number")
        or doc.get("quotation_number")
        or doc.get("receipt_number")
        or "document"
    )

    save_dir = BASE_OUTPUT_DIR / "json" / doc_type
    save_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{doc_number}".replace("/", "_") + ".json"
    file_path = save_dir / filename

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)

    return str(file_path)
