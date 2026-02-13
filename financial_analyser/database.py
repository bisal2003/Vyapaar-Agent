"""
Database integration for storing extracted financial data
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from typing import Optional, List, Dict, Any
import json

from config import settings
from schemas import DocType

Base = declarative_base()


class FinancialDocument(Base):
    """
    Database model for financial documents
    """
    __tablename__ = "financial_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Classification
    document_type = Column(String(50), index=True)
    
    # Common fields
    amount = Column(Float)
    transaction_date = Column(String(20))
    
    # UPI fields
    utr_number = Column(String(50), unique=True, nullable=True, index=True)
    sender_name = Column(String(200), nullable=True)
    receiver_name = Column(String(200), nullable=True)
    payment_app = Column(String(50), nullable=True)
    
    # Invoice fields
    vendor_name = Column(String(200), nullable=True, index=True)
    vendor_gstin = Column(String(15), nullable=True)
    invoice_number = Column(String(100), nullable=True, index=True)
    items = Column(JSON, nullable=True)  # Store as JSON array
    
    # Metadata
    description = Column(String(500), nullable=True)
    file_path = Column(String(500), nullable=True)
    confidence_score = Column(Float, nullable=True)
    raw_data = Column(JSON, nullable=True)  # Store complete extracted data
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'document_type': self.document_type,
            'amount': self.amount,
            'transaction_date': self.transaction_date,
            'utr_number': self.utr_number,
            'sender_name': self.sender_name,
            'receiver_name': self.receiver_name,
            'payment_app': self.payment_app,
            'vendor_name': self.vendor_name,
            'vendor_gstin': self.vendor_gstin,
            'invoice_number': self.invoice_number,
            'items': self.items,
            'description': self.description,
            'confidence_score': self.confidence_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class DatabaseManager:
    """
    Manager class for database operations
    """
    
    def __init__(self, database_url: str = None):
        """
        Initialize database connection
        
        Args:
            database_url: SQLAlchemy database URL
        """
        self.database_url = database_url or settings.DATABASE_URL or "sqlite:///./financial_docs.db"
        
        # Create engine
        self.engine = create_engine(
            self.database_url,
            echo=False,  # Set to True for SQL debugging
            connect_args={"check_same_thread": False} if "sqlite" in self.database_url else {}
        )
        
        # Create tables
        Base.metadata.create_all(bind=self.engine)
        
        # Create session factory
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def get_session(self):
        """Get database session"""
        return self.SessionLocal()
    
    def save_extraction(self, extracted_data: Dict[str, Any], file_path: str = None) -> FinancialDocument:
        """
        Save extracted data to database
        
        Args:
            extracted_data: Extracted document data
            file_path: Path to original image file
            
        Returns:
            Created database record
        """
        session = self.get_session()
        
        try:
            # Create record
            doc = FinancialDocument(
                document_type=extracted_data.get('document_type'),
                amount=extracted_data.get('amount'),
                transaction_date=extracted_data.get('date'),
                utr_number=extracted_data.get('utr_number'),
                sender_name=extracted_data.get('sender_name'),
                receiver_name=extracted_data.get('receiver_name'),
                payment_app=extracted_data.get('payment_app'),
                vendor_name=extracted_data.get('vendor_name'),
                vendor_gstin=extracted_data.get('gstin'),
                invoice_number=extracted_data.get('invoice_number'),
                items=extracted_data.get('items'),
                description=extracted_data.get('description'),
                file_path=file_path,
                raw_data=extracted_data
            )
            
            session.add(doc)
            session.commit()
            session.refresh(doc)
            
            return doc
            
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def get_by_id(self, doc_id: int) -> Optional[FinancialDocument]:
        """Get document by ID"""
        session = self.get_session()
        try:
            return session.query(FinancialDocument).filter(FinancialDocument.id == doc_id).first()
        finally:
            session.close()
    
    def get_by_utr(self, utr_number: str) -> Optional[FinancialDocument]:
        """Get document by UTR number"""
        session = self.get_session()
        try:
            return session.query(FinancialDocument).filter(
                FinancialDocument.utr_number == utr_number
            ).first()
        finally:
            session.close()
    
    def get_by_invoice_number(self, invoice_number: str) -> Optional[FinancialDocument]:
        """Get document by invoice number"""
        session = self.get_session()
        try:
            return session.query(FinancialDocument).filter(
                FinancialDocument.invoice_number == invoice_number
            ).first()
        finally:
            session.close()
    
    def get_by_vendor(self, vendor_name: str) -> List[FinancialDocument]:
        """Get all documents from a vendor"""
        session = self.get_session()
        try:
            return session.query(FinancialDocument).filter(
                FinancialDocument.vendor_name.ilike(f"%{vendor_name}%")
            ).all()
        finally:
            session.close()
    
    def get_by_date_range(self, start_date: str, end_date: str) -> List[FinancialDocument]:
        """Get documents within date range"""
        session = self.get_session()
        try:
            return session.query(FinancialDocument).filter(
                FinancialDocument.transaction_date.between(start_date, end_date)
            ).all()
        finally:
            session.close()
    
    def get_all(self, limit: int = 100, offset: int = 0) -> List[FinancialDocument]:
        """Get all documents with pagination"""
        session = self.get_session()
        try:
            return session.query(FinancialDocument).offset(offset).limit(limit).all()
        finally:
            session.close()
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""
        session = self.get_session()
        try:
            total_count = session.query(FinancialDocument).count()
            
            # Count by type
            type_counts = {}
            for doc_type in DocType:
                count = session.query(FinancialDocument).filter(
                    FinancialDocument.document_type == doc_type.value
                ).count()
                type_counts[doc_type.value] = count
            
            # Total amount
            from sqlalchemy import func
            total_amount = session.query(func.sum(FinancialDocument.amount)).scalar() or 0
            
            return {
                'total_documents': total_count,
                'by_type': type_counts,
                'total_amount': total_amount
            }
        finally:
            session.close()
    
    def delete(self, doc_id: int) -> bool:
        """Delete a document"""
        session = self.get_session()
        try:
            doc = session.query(FinancialDocument).filter(FinancialDocument.id == doc_id).first()
            if doc:
                session.delete(doc)
                session.commit()
                return True
            return False
        finally:
            session.close()


# Example usage
if __name__ == "__main__":
    # Initialize database
    db = DatabaseManager()
    
    # Example: Save a UPI transaction
    sample_data = {
        'document_type': 'upi_screenshot',
        'amount': 1500.00,
        'date': '01/02/2026',
        'utr_number': '123456789012',
        'sender_name': 'John Doe',
        'payment_app': 'PhonePe'
    }
    
    doc = db.save_extraction(sample_data)
    print(f"Saved document with ID: {doc.id}")
    
    # Get statistics
    stats = db.get_statistics()
    print(f"Database statistics: {stats}")
