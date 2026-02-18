"""
Data schemas for financial document extraction
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
import re


class DocType(str, Enum):
    """Document type classification"""
    UPI_SCREENSHOT = "upi_screenshot"
    INVOICE = "invoice"
    HANDWRITTEN_NOTE = "handwritten_note"
    UNKNOWN = "unknown"


class ExtractedData(BaseModel):
    """
    Schema for extracted financial document data
    """
    
    # Classification
    document_type: DocType = Field(
        description="The classification of the document image"
    )
    
    # Common Fields (Required)
    amount: Optional[float] = Field(
        default=None,
        description="The total transaction/invoice amount in INR",
        ge=0  # Greater than or equal to 0
    )
    
    date: Optional[str] = Field(
        default=None,
        description="Date in DD/MM/YYYY format"
    )
    
    # Invoice-specific Fields
    vendor_name: Optional[str] = Field(
        default=None,
        description="Name of the shop, business, or merchant"
    )
    
    gstin: Optional[str] = Field(
        default=None,
        description="GST Identification Number (15 characters)",
        max_length=15,
        min_length=15
    )
    
    items: Optional[List[str]] = Field(
        default=None,
        description="List of purchased items or services"
    )
    
    invoice_number: Optional[str] = Field(
        default=None,
        description="Invoice/Bill number"
    )
    
    # UPI-specific Fields
    utr_number: Optional[str] = Field(
        default=None,
        description="UPI Transaction ID / UTR / Reference Number"
    )
    
    sender_name: Optional[str] = Field(
        default=None,
        description="Name of the person sending money (for UPI)"
    )
    
    receiver_name: Optional[str] = Field(
        default=None,
        description="Name of the person/business receiving money"
    )
    
    payment_app: Optional[str] = Field(
        default=None,
        description="UPI app used: PhonePe, GPay, Paytm, BHIM, etc."
    )
    
    # Additional Fields
    description: Optional[str] = Field(
        default=None,
        description="Transaction description or notes"
    )
    
    @field_validator('date')
    @classmethod
    def validate_date(cls, v):
        """Validate date format DD/MM/YYYY"""
        if v is None:
            return v
        
        # Check format
        date_pattern = r'^\d{2}/\d{2}/\d{4}$'
        if not re.match(date_pattern, v):
            # Try to fix common issues
            v = v.strip()
            if not re.match(date_pattern, v):
                return None  # Invalid format, return None instead of raising error
        
        return v
    
    @field_validator('gstin')
    @classmethod
    def validate_gstin(cls, v):
        """Validate GSTIN format (15 characters alphanumeric)"""
        if v is None:
            return v
        
        # Remove spaces and convert to uppercase
        v = v.replace(' ', '').upper()
        
        # GSTIN format: 2 digits + 10 chars + 1 digit + 1 char + 1 char
        gstin_pattern = r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$'
        
        if len(v) == 15 and re.match(r'^[A-Z0-9]{15}$', v):
            return v
        
        return None  # Invalid GSTIN
    
    @field_validator('utr_number')
    @classmethod
    def validate_utr(cls, v):
        """Validate UTR number"""
        if v is None:
            return v
        
        # Remove spaces
        v = v.replace(' ', '').upper()
        
        # UTR is typically 12-16 digits/characters
        if len(v) >= 10 and len(v) <= 20:
            return v
        
        return None
    
    class Config:
        """Pydantic config"""
        use_enum_values = True


class ProcessingResult(BaseModel):
    """
    Result of document processing
    """
    status: str = Field(description="success or error")
    timestamp: str = Field(description="ISO format timestamp")
    data: Optional[ExtractedData] = Field(default=None)
    confidence_score: Optional[float] = Field(default=None, ge=0, le=100)
    error: Optional[str] = Field(default=None)
    file_name: Optional[str] = Field(default=None)


class BatchProcessingResult(BaseModel):
    """
    Result of batch processing
    """
    total_processed: int
    successful: int
    failed: int
    results: List[ProcessingResult]
    batch_timestamp: str
