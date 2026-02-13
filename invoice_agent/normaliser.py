def normalize_document(doc: dict) -> dict:
    """
    Converts LLM-output JSON into canonical schema
    """

    doc = doc.copy()

    # Normalize document_type
    doc["document_type"] = doc["document_type"].lower().replace(" ", "_")

    # Normalize items
    normalized_items = []
    for item in doc.get("items", []):
        normalized_items.append({
            "description": item.get("description") or item.get("product_name"),
            "hsn_code": item.get("hsn_code") or item.get("HSN"),
            "quantity": item.get("quantity", 1),
            "unit": item.get("unit", "Nos"),
            "rate": item.get("rate") or item.get("unit_price", 0),
            "amount": item.get("amount") or item.get("item_total", 0)
        })

    doc["items"] = normalized_items

    # Totals normalization
    doc["subtotal"] = doc.get("subtotal", doc.get("subtotal_amount", 0))
    doc["cgst_amount"] = doc.get("cgst_amount", doc.get("CGST_amount", 0))
    doc["sgst_amount"] = doc.get("sgst_amount", doc.get("SGST_amount", 0))
    doc["total"] = doc.get("total", doc.get("total_amount", 0))

    return doc
