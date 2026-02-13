"""
Financial Document AI Agent
Extracts structured data from UPI screenshots, bills, and invoices
"""

from google import genai
from PIL import Image
import json
import logging
from pathlib import Path
from typing import Union, Dict, Any
from datetime import datetime
import base64
from io import BytesIO
from schemas import ExtractedData, DocType
from config import settings
from utils import (
    save_json_output,
    validate_image,
    sanitize_filename,
    save_extraction_log
)
from prompts.financial_extraction import FINANCIAL_DOCUMENT_PROMPT

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)



    
class FinancialDocumentAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("API key not provided")

        self.client = genai.Client(api_key=self.api_key)
        logger.info(f"Agent initialized with model: {settings.MODEL_NAME}")
    

    def process_image(self, image_input):
        image = self.load_image(image_input)
        
        # Get filename if available
        filename = None
        if isinstance(image_input, (str, Path)):
            filename = Path(image_input).name

        prompt = FINANCIAL_DOCUMENT_PROMPT


        response = self.client.models.generate_content(
            model=settings.MODEL_NAME,
            contents=[prompt, image],
            config={
                "response_mime_type": "application/json",
                "response_schema": ExtractedData,
                "temperature": 0.1,
            }
        )

        try:
            data = json.loads(response.text)
        except Exception as e:
            return {
                "status": "error",
                "error": f"Model returned invalid JSON: {str(e)}",
                "data": None
            }

        data["document_type"] = data.get("document_type", "unknown")

        result = {
            "status": "success",
            "filename": filename,
            "timestamp": datetime.now().isoformat(),
            "data": data,
            "confidence_score": self._calculate_confidence(data)
        }
        
        # SAVE INDIVIDUAL RESULT


        output_path = save_json_output(
            result=result,
            output_dir=settings.OUTPUT_DIR,
            filename=filename
        )

        logger.info(f"💾 Saved result to: {output_path}")
        
        return result
    def load_image(self, image_input: Union[str, Path, Image.Image, bytes]) -> Image.Image:
        """Load image from various input types"""
        if isinstance(image_input, Image.Image):
            return image_input
        elif isinstance(image_input, bytes):
            return Image.open(BytesIO(image_input))
        elif isinstance(image_input, (str, Path)):
            path = Path(image_input)
            if not path.exists():
                raise FileNotFoundError(f"Image not found: {path}")
            return Image.open(path)
        else:
            raise TypeError(f"Unsupported image input type: {type(image_input)}")
    
    def _calculate_confidence(self, data: Dict) -> float:
        """
        Calculate confidence score based on completeness of extraction
        """
        doc_type = data.get('document_type')
        score = 0.0
        
        # Base score for classification
        if doc_type != 'unknown':
            score += 30
        
        # Score for required fields
        if data.get('amount'):
            score += 40
        
        # Type-specific scoring
        if doc_type == 'upi_screenshot':
            if data.get('utr_number'):
                score += 20
            if data.get('payment_app'):
                score += 10
        elif doc_type == 'invoice':
            if data.get('vendor_name'):
                score += 15
            if data.get('gstin'):
                score += 15
        
        return min(score, 100.0)
    
    def batch_process(
        self, 
        image_paths: list,
        output_format: str = "json"
    ) -> list:
        """
        Process multiple images in batch
        
        Args:
            image_paths: List of image file paths
            output_format: 'json' or 'csv'
            
        Returns:
            List of extraction results
        """
        results = []
        
        logger.info(f"Starting batch processing of {len(image_paths)} images")
        
        for idx, img_path in enumerate(image_paths, 1):
            logger.info(f"Processing {idx}/{len(image_paths)}: {img_path}")
            result = self.process_image(img_path)
            results.append({
                "file": str(img_path),
                **result
            })
        
        # Save batch results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = Path(settings.LOGS_DIR) / f"batch_results_{timestamp}.json"
        
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"Batch processing complete. Results saved to {output_path}")
        return results


def main():
    """Example usage"""
    agent = FinancialDocumentAgent()
    
    # Example 1: Single image processing
    image_path = settings.UPLOAD_DIR / "test_image.jpg"
    result = agent.process_image(image_path)
    
    if result['status'] == 'success':
        data = result['data']
        doc_type = data['document_type']
        
        print(f"\n{'='*50}")
        print(f"Document Type: {doc_type.upper()}")
        print(f"Confidence: {result['confidence_score']:.1f}%")
        print(f"{'='*50}\n")
        
        if doc_type == "upi_screenshot":
            print(f"✅ Payment Received via {data.get('payment_app', 'UPI')}")
            print(f"💰 Amount: ₹{data['amount']}")
            print(f"🆔 UTR: {data.get('utr_number', 'N/A')}")
            print(f"👤 From: {data.get('sender_name', 'N/A')}")
            print(f"📅 Date: {data.get('date', 'N/A')}")
            
        elif doc_type == "invoice":
            print(f"🧾 Invoice from: {data.get('vendor_name', 'N/A')}")
            print(f"💰 Total: ₹{data['amount']}")
            print(f"📋 GSTIN: {data.get('gstin', 'N/A')}")
            print(f"📅 Date: {data.get('date', 'N/A')}")
            if data.get('items'):
                print(f"📦 Items: {', '.join(data['items'][:3])}...")
        
        print(f"\n{'='*50}\n")
    else:
        print(f"❌ Error: {result['error']}")


if __name__ == "__main__":
    main()
