"""
PDF Generator for Transaction Documents
Supports: GST Invoice, Bill of Supply, Quotation, Payment Receipt
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib import colors
from pathlib import Path
from datetime import datetime

# Output directory
OUTPUT_DIR = Path("outputs/pdf")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Business details (customize these)
BUSINESS_CONFIG = {
    "name": "Your Business Name",
    "address": "123 Main Street, Mumbai, Maharashtra 400001",
    "gstin": "27XXXXX1234X1Z5",
    "phone": "+91 98765 43210",
    "email": "business@example.com"
}


def generate_gst_invoice_pdf(data: dict) -> str:
    """Generate GST Invoice PDF"""
    filename = f"GST_Invoice_{data.get('invoice_number', datetime.now().timestamp())}.pdf".replace('/', '_')
    file_path = OUTPUT_DIR / filename
    
    c = canvas.Canvas(str(file_path), pagesize=A4)
    width, height = A4
    
    # ============ Header ============
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 30, "TAX INVOICE")
    
    # Business details
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20, height - 60, BUSINESS_CONFIG["name"])
    c.setFont("Helvetica", 9)
    c.drawString(20, height - 75, BUSINESS_CONFIG["address"])
    c.drawString(20, height - 88, f"GSTIN: {BUSINESS_CONFIG['gstin']}")
    c.drawString(20, height - 101, f"Phone: {BUSINESS_CONFIG['phone']}")
    
    # Invoice details (right side)
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(width - 20, height - 60, f"Invoice No: {data.get('invoice_number', 'N/A')}")
    c.setFont("Helvetica", 9)
    c.drawRightString(width - 20, height - 75, f"Date: {data.get('invoice_date', 'N/A')}")
    
    # ============ Line separator ============
    c.line(20, height - 115, width - 20, height - 115)
    
    # ============ Customer Details ============
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20, height - 135, "Bill To:")
    c.setFont("Helvetica", 10)
    c.drawString(20, height - 150, data.get("customer_name", "N/A"))
    if data.get("customer_address"):
        c.drawString(20, height - 165, data.get("customer_address"))
        y_offset = 180
    else:
        y_offset = 165
    
    c.drawString(20, height - y_offset, f"GSTIN: {data.get('customer_gstin', 'Unregistered')}")
    
    # ============ Items Table ============
    table_start_y = height - (y_offset + 40)
    
    table_data = [
        ["#", "Description", "HSN", "Qty", "Unit", "Rate", "Amount"]
    ]
    
    for idx, item in enumerate(data.get("items", []), 1):
        table_data.append([
            str(idx),
            item.get("description", "-"),
            item.get("hsn_code", "-"),
            str(item.get("quantity", 0)),
            item.get("unit", "Nos"),
            f"₹{item.get('rate', 0):.2f}",
            f"₹{item.get('amount', 0):.2f}"
        ])
    
    table = Table(
        table_data,
        colWidths=[10*mm, 60*mm, 20*mm, 15*mm, 15*mm, 25*mm, 30*mm]
    )
    
    table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8E8E8")),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (3, 1), (-1, -1), "RIGHT"),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
        ("FONT", (0, 1), (-1, -1), "Helvetica", 9),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    
    table.wrapOn(c, width, height)
    table_height = len(table_data) * 18
    table.drawOn(c, 20, table_start_y - table_height)
    
    # ============ Totals Section ============
    y_pos = table_start_y - table_height - 30
    
    c.setFont("Helvetica", 10)
    c.drawRightString(width - 70, y_pos, "Subtotal:")
    c.drawRightString(width - 20, y_pos, f"₹{data.get('subtotal', 0):.2f}")
    
    y_pos -= 15
    c.drawRightString(width - 70, y_pos, f"CGST ({data.get('cgst_rate', 9)}%):")
    c.drawRightString(width - 20, y_pos, f"₹{data.get('cgst_amount', 0):.2f}")
    
    y_pos -= 15
    c.drawRightString(width - 70, y_pos, f"SGST ({data.get('sgst_rate', 9)}%):")
    c.drawRightString(width - 20, y_pos, f"₹{data.get('sgst_amount', 0):.2f}")
    
    # Total
    c.setFont("Helvetica-Bold", 12)
    y_pos -= 25
    c.drawRightString(width - 70, y_pos, "Grand Total:")
    c.drawRightString(width - 20, y_pos, f"₹{data.get('total', 0):.2f}")
    
    # ============ Footer ============
    c.setFont("Helvetica-Italic", 8)
    c.drawString(20, 60, "Terms & Conditions:")
    c.setFont("Helvetica", 7)
    c.drawString(20, 50, "1. Payment due within 30 days")
    c.drawString(20, 42, "2. This is a computer-generated invoice")
    
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(width - 20, 50, "Authorised Signatory")
    c.line(width - 120, 48, width - 20, 48)
    
    c.showPage()
    c.save()
    
    return str(file_path)


def generate_bill_of_supply_pdf(data: dict) -> str:
    """Generate Bill of Supply PDF (for composition scheme)"""
    filename = f"Bill_of_Supply_{data.get('bill_number', datetime.now().timestamp())}.pdf".replace('/', '_')
    file_path = OUTPUT_DIR / filename
    
    c = canvas.Canvas(str(file_path), pagesize=A4)
    width, height = A4
    
    # ============ Header ============
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 30, "BILL OF SUPPLY")
    
    c.setFont("Helvetica", 8)
    c.drawCentredString(width / 2, height - 45, "(Under Composition Scheme)")
    
    # Business details
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20, height - 70, BUSINESS_CONFIG["name"])
    c.setFont("Helvetica", 9)
    c.drawString(20, height - 85, BUSINESS_CONFIG["address"])
    c.drawString(20, height - 98, f"Phone: {BUSINESS_CONFIG['phone']}")
    
    # Bill details
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(width - 20, height - 70, f"Bill No: {data.get('bill_number', 'N/A')}")
    c.setFont("Helvetica", 9)
    c.drawRightString(width - 20, height - 85, f"Date: {data.get('bill_date', 'N/A')}")
    
    # Line separator
    c.line(20, height - 115, width - 20, height - 115)
    
    # Customer
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20, height - 135, "Bill To:")
    c.setFont("Helvetica", 10)
    c.drawString(20, height - 150, data.get("customer_name", "Cash Customer"))
    
    # Items Table
    table_data = [
        ["#", "Description", "Qty", "Unit", "Amount"]
    ]
    
    for idx, item in enumerate(data.get("items", []), 1):
        table_data.append([
            str(idx),
            item.get("description", "-"),
            str(item.get("quantity", 0)),
            item.get("unit", "Nos"),
            f"₹{item.get('amount', 0):.2f}"
        ])
    
    table = Table(
        table_data,
        colWidths=[15*mm, 100*mm, 20*mm, 20*mm, 30*mm]
    )
    
    table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8E8E8")),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
        ("FONT", (0, 1), (-1, -1), "Helvetica", 9),
    ]))
    
    table.wrapOn(c, width, height)
    table_height = len(table_data) * 18
    table.drawOn(c, 20, height - 200 - table_height)
    
    # Total
    y_pos = height - 220 - table_height
    c.setFont("Helvetica-Bold", 12)
    c.drawRightString(width - 60, y_pos, "Total:")
    c.drawRightString(width - 20, y_pos, f"₹{data.get('total', 0):.2f}")
    
    # Note
    c.setFont("Helvetica-Italic", 9)
    c.drawString(20, y_pos - 30, data.get("note", "Bill of Supply - Composition Scheme"))
    
    # Footer
    c.setFont("Helvetica", 7)
    c.drawString(20, 50, "This is a computer-generated bill")
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(width - 20, 50, "Authorised Signatory")
    
    c.showPage()
    c.save()
    
    return str(file_path)


def generate_quotation_pdf(data: dict) -> str:
    """Generate Quotation/Estimate PDF"""
    filename = f"Quotation_{data.get('quotation_number', datetime.now().timestamp())}.pdf".replace('/', '_')
    file_path = OUTPUT_DIR / filename
    
    c = canvas.Canvas(str(file_path), pagesize=A4)
    width, height = A4
    
    # Header
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 30, "QUOTATION")
    
    c.setFont("Helvetica-Italic", 9)
    c.drawCentredString(width / 2, height - 45, "** Estimate Only - Not a Tax Invoice **")
    
    # Business details
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20, height - 70, BUSINESS_CONFIG["name"])
    c.setFont("Helvetica", 9)
    c.drawString(20, height - 85, BUSINESS_CONFIG["address"])
    c.drawString(20, height - 98, f"Phone: {BUSINESS_CONFIG['phone']}")
    
    # Quotation details
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(width - 20, height - 70, f"Quotation No: {data.get('quotation_number', 'N/A')}")
    c.setFont("Helvetica", 9)
    c.drawRightString(width - 20, height - 85, f"Date: {data.get('quotation_date', 'N/A')}")
    c.drawRightString(width - 20, height - 98, f"Valid Until: {data.get('valid_until', 'N/A')}")
    
    c.line(20, height - 115, width - 20, height - 115)
    
    # Customer
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20, height - 135, "Prepared For:")
    c.setFont("Helvetica", 10)
    c.drawString(20, height - 150, data.get("customer_name", "N/A"))
    
    # Items Table
    table_data = [
        ["#", "Description", "Qty", "Unit", "Rate", "Amount"]
    ]
    
    for idx, item in enumerate(data.get("items", []), 1):
        table_data.append([
            str(idx),
            item.get("description", "-"),
            str(item.get("quantity", 0)),
            item.get("unit", "Nos"),
            f"₹{item.get('rate', 0):.2f}",
            f"₹{item.get('amount', 0):.2f}"
        ])
    
    table = Table(
        table_data,
        colWidths=[15*mm, 75*mm, 20*mm, 20*mm, 30*mm, 30*mm]
    )
    
    table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8E8E8")),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
        ("FONT", (0, 1), (-1, -1), "Helvetica", 9),
    ]))
    
    table.wrapOn(c, width, height)
    table_height = len(table_data) * 18
    table.drawOn(c, 20, height - 200 - table_height)
    
    # Totals
    y_pos = height - 220 - table_height
    
    c.setFont("Helvetica", 10)
    c.drawRightString(width - 60, y_pos, "Subtotal:")
    c.drawRightString(width - 20, y_pos, f"₹{data.get('subtotal', 0):.2f}")
    
    y_pos -= 15
    c.setFont("Helvetica-Italic", 8)
    c.drawRightString(width - 20, y_pos, data.get("tax_note", "GST Extra as applicable"))
    
    y_pos -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawRightString(width - 60, y_pos, "Estimated Total:")
    c.drawRightString(width - 20, y_pos, f"₹{data.get('total_estimate', 0):.2f}")
    
    # Note
    c.setFont("Helvetica-Italic", 9)
    c.drawString(20, y_pos - 30, data.get("note", "Estimate Only - Not a Tax Invoice"))
    
    # Footer
    c.setFont("Helvetica", 7)
    c.drawString(20, 50, "This quotation is valid for 14 days from the date of issue")
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(width - 20, 50, "Prepared By")
    
    c.showPage()
    c.save()
    
    return str(file_path)


def generate_payment_receipt_pdf(data: dict) -> str:
    """Generate Payment Receipt PDF"""
    filename = f"Receipt_{data.get('receipt_number', datetime.now().timestamp())}.pdf".replace('/', '_')
    file_path = OUTPUT_DIR / filename
    
    c = canvas.Canvas(str(file_path), pagesize=A4)
    width, height = A4
    
    # Header
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 30, "PAYMENT RECEIPT")
    
    # Business details
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20, height - 60, BUSINESS_CONFIG["name"])
    c.setFont("Helvetica", 9)
    c.drawString(20, height - 75, BUSINESS_CONFIG["address"])
    
    # Receipt details
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(width - 20, height - 60, f"Receipt No: {data.get('receipt_number', 'N/A')}")
    c.setFont("Helvetica", 9)
    c.drawRightString(width - 20, height - 75, f"Date: {data.get('receipt_date', 'N/A')}")
    
    c.line(20, height - 95, width - 20, height - 95)
    
    # Receipt body
    c.setFont("Helvetica", 11)
    y = height - 120
    
    c.drawString(40, y, "Received with thanks from:")
    c.setFont("Helvetica-Bold", 12)
    c.drawString(60, y - 20, data.get("received_from", "N/A"))
    
    y -= 50
    c.setFont("Helvetica", 11)
    c.drawString(40, y, "Amount Received:")
    c.setFont("Helvetica-Bold", 14)
    c.drawString(60, y - 25, f"₹ {data.get('amount_received', 0):.2f}")
    
    y -= 55
    c.setFont("Helvetica", 11)
    c.drawString(40, y, "Payment Mode:")
    c.setFont("Helvetica-Bold", 11)
    c.drawString(60, y - 20, data.get("payment_mode", "N/A"))
    
    y -= 50
    c.setFont("Helvetica", 11)
    c.drawString(40, y, "Payment For:")
    c.setFont("Helvetica", 10)
    c.drawString(60, y - 20, data.get("payment_for", "General Payment"))
    
    # Balance table (if applicable)
    if data.get("previous_balance"):
        y -= 60
        c.setFont("Helvetica-Bold", 10)
        c.drawString(40, y, "Account Summary:")
        
        balance_data = [
            ["Previous Balance", f"₹{data.get('previous_balance', 0):.2f}"],
            ["Amount Paid", f"₹{data.get('amount_received', 0):.2f}"],
            ["Current Balance", f"₹{data.get('current_balance', 0):.2f}"]
        ]
        
        balance_table = Table(balance_data, colWidths=[80*mm, 40*mm])
        balance_table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F0F0F0")),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("FONT", (0, 0), (-1, -1), "Helvetica", 10),
            ("FONT", (0, -1), (-1, -1), "Helvetica-Bold", 10),
        ]))
        
        balance_table.wrapOn(c, width, height)
        balance_table.drawOn(c, 60, y - 70)
    
    # Footer
    c.setFont("Helvetica-Italic", 8)
    c.drawString(20, 70, "This is a computer-generated receipt")
    
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(width - 20, 60, "Received By")
    c.line(width - 120, 58, width - 20, 58)
    
    c.showPage()
    c.save()
    
    return str(file_path)


def generate_pdf(data: dict) -> str:
    """
    Main PDF generator - routes to appropriate function based on document type
    
    Args:
        data: Document JSON data
        
    Returns:
        Path to generated PDF file
    """
    doc_type = data.get("document_type")
    
    if doc_type == "gst_invoice":
        return generate_gst_invoice_pdf(data)
    elif doc_type == "bill_of_supply":
        return generate_bill_of_supply_pdf(data)
    elif doc_type == "quotation":
        return generate_quotation_pdf(data)
    elif doc_type == "payment_receipt":
        return generate_payment_receipt_pdf(data)
    else:
        raise ValueError(f"Unknown document type: {doc_type}")


# ============ Business Configuration ============
def update_business_config(name=None, address=None, gstin=None, phone=None, email=None):
    """Update business details for PDF headers"""
    if name:
        BUSINESS_CONFIG["name"] = name
    if address:
        BUSINESS_CONFIG["address"] = address
    if gstin:
        BUSINESS_CONFIG["gstin"] = gstin
    if phone:
        BUSINESS_CONFIG["phone"] = phone
    if email:
        BUSINESS_CONFIG["email"] = email