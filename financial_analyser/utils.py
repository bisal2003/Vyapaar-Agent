"""
Utility functions for the Financial Document Agent
"""
import json
import re
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Any
from PIL import Image

from config import settings


logger = logging.getLogger(__name__)


def validate_image(img: Image.Image) -> bool:
    """
    Validate image meets requirements
    
    Args:
        img: PIL Image object
        
    Returns:
        True if valid
        
    Raises:
        ValueError: If image is invalid
    """
    # Check format
    if img.format and img.format.lower() not in settings.SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported format: {img.format}. "
            f"Supported: {', '.join(settings.SUPPORTED_FORMATS)}"
        )
    
    # Check size
    width, height = img.size
    if width < 100 or height < 100:
        raise ValueError(f"Image too small: {width}x{height}. Minimum: 100x100")
    
    if width > 4096 or height > 4096:
        logger.warning(f"Large image detected: {width}x{height}. May be resized.")
    
    # Check file size (approximate)
    # Note: This is an approximation as we're working with PIL Image
    
    return True


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe storage
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Remove path components
    filename = Path(filename).name
    
    # Remove special characters
    filename = re.sub(r'[^\w\s.-]', '', filename)
    
    # Replace spaces with underscores
    filename = filename.replace(' ', '_')
    
    # Limit length
    if len(filename) > 100:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:95] + (f'.{ext}' if ext else '')
    
    return filename


def save_extraction_log(result: Dict[str, Any]) -> Path:
    """
    Save extraction result to log file
    
    Args:
        result: Extraction result dictionary
        
    Returns:
        Path to log file
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = settings.LOGS_DIR / f"extraction_{timestamp}.json"
    
    with open(log_file, 'w') as f:
        json.dump(result, f, indent=2)
    
    logger.info(f"Extraction log saved to {log_file}")
    return log_file


def format_currency(amount: float) -> str:
    """
    Format amount as Indian currency
    
    Args:
        amount: Amount in rupees
        
    Returns:
        Formatted string (e.g., "₹1,23,456.78")
    """
    if amount is None:
        return "N/A"
    
    # Indian number formatting (lakhs, crores)
    s = f"{amount:,.2f}"
    
    # Convert to Indian style (1,00,000 instead of 100,000)
    parts = s.split('.')
    integer_part = parts[0].replace(',', '')
    
    if len(integer_part) > 3:
        # Last 3 digits
        last_three = integer_part[-3:]
        # Remaining digits in groups of 2
        remaining = integer_part[:-3]
        
        # Group remaining digits
        groups = []
        while remaining:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        
        integer_part = ','.join(groups) + ',' + last_three
    
    formatted = integer_part + (f".{parts[1]}" if len(parts) > 1 else "")
    
    return f"₹{formatted}"


def generate_summary_report(results: list) -> str:
    """
    Generate a summary report from batch processing results
    
    Args:
        results: List of processing results
        
    Returns:
        Formatted summary string
    """
    total = len(results)
    successful = sum(1 for r in results if r.get('status') == 'success')
    failed = total - successful
    
    # Count by document type
    doc_types = {}
    total_amount = 0
    
    for result in results:
        if result.get('status') == 'success':
            data = result.get('data', {})
            doc_type = data.get('document_type', 'unknown')
            doc_types[doc_type] = doc_types.get(doc_type, 0) + 1
            
            if data.get('amount'):
                total_amount += data['amount']
    
    summary = f"""
╔══════════════════════════════════════════╗
║     BATCH PROCESSING SUMMARY             ║
╚══════════════════════════════════════════╝

📊 Overall Statistics:
   • Total Processed: {total}
   • Successful: {successful}
   • Failed: {failed}
   • Success Rate: {(successful/total*100):.1f}%

📄 Document Types:
"""
    
    for doc_type, count in doc_types.items():
        summary += f"   • {doc_type}: {count}\n"
    
    summary += f"\n💰 Total Amount Extracted: {format_currency(total_amount)}\n"
    summary += f"\n⏰ Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    
    return summary


def convert_to_database_format(extracted_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert extracted data to database-ready format
    
    Args:
        extracted_data: Raw extracted data
        
    Returns:
        Database-ready dictionary
    """
    doc_type = extracted_data.get('document_type')
    
    # Common fields
    db_record = {
        'document_type': doc_type,
        'amount': extracted_data.get('amount'),
        'transaction_date': extracted_data.get('date'),
        'created_at': datetime.now().isoformat(),
    }
    
    # Type-specific fields
    if doc_type == 'upi_screenshot':
        db_record.update({
            'transaction_id': extracted_data.get('utr_number'),
            'sender': extracted_data.get('sender_name'),
            'receiver': extracted_data.get('receiver_name'),
            'payment_method': extracted_data.get('payment_app'),
            'description': extracted_data.get('description'),
        })
    
    elif doc_type == 'invoice':
        db_record.update({
            'vendor_name': extracted_data.get('vendor_name'),
            'vendor_gstin': extracted_data.get('gstin'),
            'invoice_number': extracted_data.get('invoice_number'),
            'items': json.dumps(extracted_data.get('items', [])),
        })
    
    elif doc_type == 'handwritten_note':
        db_record.update({
            'vendor_name': extracted_data.get('vendor_name'),
            'description': extracted_data.get('description'),
        })
    
    # Remove None values
    db_record = {k: v for k, v in db_record.items() if v is not None}
    
    return db_record


def validate_utr(utr: str) -> bool:
    """
    Validate UPI UTR number
    
    Args:
        utr: UTR number string
        
    Returns:
        True if valid format
    """
    if not utr:
        return False
    
    # Remove spaces
    utr = utr.replace(' ', '')
    
    # UTR is typically 12 digits for NPCI
    # But can vary by bank/payment provider (10-16 chars)
    if len(utr) >= 10 and len(utr) <= 20:
        # Should be alphanumeric
        if re.match(r'^[A-Z0-9]+$', utr.upper()):
            return True
    
    return False


def validate_gstin(gstin: str) -> bool:
    """
    Validate GST Identification Number
    
    Args:
        gstin: GSTIN string
        
    Returns:
        True if valid format
    """
    if not gstin or len(gstin) != 15:
        return False
    
    # Format: 2 digits + 10 chars + 1 digit + 1 char + 1 char
    pattern = r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$'
    
    return bool(re.match(pattern, gstin.upper()))


def parse_indian_date(date_str: str) -> str:
    """
    Parse various Indian date formats to DD/MM/YYYY
    
    Args:
        date_str: Date string in various formats
        
    Returns:
        Standardized DD/MM/YYYY string or None
    """
    if not date_str:
        return None
    
    # Try different patterns
    patterns = [
        r'(\d{2})/(\d{2})/(\d{4})',  # DD/MM/YYYY
        r'(\d{2})-(\d{2})-(\d{4})',  # DD-MM-YYYY
        r'(\d{4})-(\d{2})-(\d{2})',  # YYYY-MM-DD
        r'(\d{2})\.(\d{2})\.(\d{4})',  # DD.MM.YYYY
    ]
    
    for pattern in patterns:
        match = re.search(pattern, date_str)
        if match:
            groups = match.groups()
            
            # Check if YYYY-MM-DD format
            if len(groups[0]) == 4:
                year, month, day = groups
                return f"{day}/{month}/{year}"
            else:
                day, month, year = groups
                return f"{day}/{month}/{year}"
    
    return None

def save_json_output(result: dict, output_dir: Path, filename: str | None = None):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    if filename:
        stem = Path(filename).stem
        output_path = output_dir / f"{stem}_{timestamp}.json"
    else:
        output_path = output_dir / f"result_{timestamp}.json"

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    return output_path
