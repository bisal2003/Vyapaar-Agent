from fastapi import FastAPI, Query, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from invoice_agent.miscFiles.invoice_agent import process_user_input
from financial_analyser.miscFiles.financial_agent import FinancialDocumentAgent
from dotenv import load_dotenv
import os
from pathlib import Path
import shutil

load_dotenv()

app = FastAPI(
    title="Vyapaar Agent API",
    description="API for Invoice Generation and Financial Document Processing",
    version="1.0.0"
)


@app.get("/")
def read_root():
    """Root endpoint with API information"""
    return {
        "message": "Vyapaar Agent API",
        "version": "1.0.0",
        "endpoints": {
            "invoice_generation": {
                "path": "/invoice",
                "method": "GET",
                "description": "Generate invoice from natural language command",
                "example": "/invoice?command=make gst bill for CJ"
            },
            "financial_ocr": {
                "path": "/financial-ocr",
                "method": "POST",
                "description": "Extract data from financial document images",
                "content_type": "multipart/form-data"
            },
            "documentation": "/docs"
        }
    }


@app.get("/invoice")
def create_invoice(command: str = Query(..., description="Natural language command to generate invoice (e.g., 'make gst bill for CJ')")):
    """
    Generate an invoice from natural language command
    
    Args:
        command: Natural language command like "make gst bill for CJ"
    
    Returns:
        JSON response with generated document or clarification questions
    """
    # Check for API key
    if not os.getenv('GEMINI_API_KEY'):
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY not configured in environment"
        )
    
    try:
        # Process the command
        result = process_user_input(command)
        
        if "error" in result:
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "error": result.get("error"),
                    "command": command
                }
            )
        
        # Check if document is complete or needs clarification
        if result.get("status") == "complete":
            return {
                "status": "success",
                "message": "Invoice generated successfully",
                "document": result["document"],
                "json_path": result["json_path"],
                "command": command
            }
        
        elif result.get("status") == "needs_clarification":
            return {
                "status": "needs_clarification",
                "message": "Additional information required",
                "missing_fields": result["missing_fields"],
                "clarification_questions": result["clarification_questions"],
                "partial_document": result["partial_document"],
                "command": command
            }
        
        else:
            raise HTTPException(
                status_code=500,
                detail="Unexpected response from invoice processor"
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing command: {str(e)}"
        )


@app.post("/financial-ocr")
async def extract_financial_document(file: UploadFile = File(..., description="Image file (receipt, invoice, or UPI screenshot)")):
    """
    Extract data from financial document image using OCR
    
    Args:
        file: Image file (JPEG, PNG, etc.) of receipt, invoice, or UPI screenshot
    
    Returns:
        JSON response with extracted financial data
    """
    # Check for API key
    if not os.getenv('GEMINI_API_KEY'):
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY not configured in environment"
        )
    
    # Validate file type
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Create temporary directory for uploads
        temp_dir = Path("temp_uploads")
        temp_dir.mkdir(exist_ok=True)
        
        # Save uploaded file temporarily
        temp_file_path = temp_dir / file.filename
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process the image
        agent = FinancialDocumentAgent()
        result = agent.process_image(temp_file_path)
        
        # Clean up temp file
        temp_file_path.unlink()
        
        # Check result status
        if result.get("status") == "error":
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "error": result.get("error"),
                    "filename": file.filename
                }
            )
        
        # Return successful result
        return {
            "status": "success",
            "message": "Document processed successfully",
            "filename": file.filename,
            "document_type": result["data"].get("document_type"),
            "confidence_score": result.get("confidence_score"),
            "timestamp": result.get("timestamp"),
            "data": result["data"]
        }
    
    except Exception as e:
        # Clean up temp file on error
        if temp_file_path.exists():
            temp_file_path.unlink()
        
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
