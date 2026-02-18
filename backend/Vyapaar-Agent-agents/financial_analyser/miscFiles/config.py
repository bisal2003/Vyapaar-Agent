"""
Configuration management for the Financial Document Agent
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    
    # API Configuration
    GEMINI_API_KEY: str = ""
    MODEL_NAME: str = "gemini-2.5-flash"
    MODEL_TEMPERATURE: float = 0.3
    
    # Alternative models you can use:
    # - gemini-1.5-flash (fast, cost-effective)
    # - gemini-1.5-pro (more accurate, slower)
    # - gemini-1.0-pro-vision (older model)
    
    # File paths
    BASE_DIR: Path = Path(__file__).parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    LOGS_DIR: Path = BASE_DIR / "logs"
    OUTPUT_DIR: Path = BASE_DIR / "outputs"
    
    # Processing settings
    MAX_IMAGE_SIZE_MB: int = 10
    SUPPORTED_FORMATS: list = ["jpg", "jpeg", "png", "webp", "heic", "heif"]
    
    # Batch processing
    BATCH_SIZE: int = 10
    BATCH_DELAY_SECONDS: float = 0.5  # Delay between requests
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "agent.log"
    
    # Database (optional - for future use)
    DATABASE_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Create directories if they don't exist
        self.UPLOAD_DIR.mkdir(exist_ok=True)
        self.LOGS_DIR.mkdir(exist_ok=True)
        self.OUTPUT_DIR.mkdir(exist_ok=True)


# Global settings instance
settings = Settings()


# Validation
def validate_settings():
    """Validate that required settings are configured"""
    errors = []
    
    if not settings.GEMINI_API_KEY:
        errors.append("GEMINI_API_KEY not set in .env file")
    
    if errors:
        raise ValueError(f"Configuration errors: {', '.join(errors)}")


if __name__ == "__main__":
    # Test configuration
    print("Current Configuration:")
    print(f"Model: {settings.MODEL_NAME}")
    print(f"Upload Dir: {settings.UPLOAD_DIR}")
    print(f"Logs Dir: {settings.LOGS_DIR}")
    print(f"Max Image Size: {settings.MAX_IMAGE_SIZE_MB}MB")
    print(f"Supported Formats: {', '.join(settings.SUPPORTED_FORMATS)}")
