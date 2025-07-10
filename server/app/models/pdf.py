from beanie import Document
from pydantic import Field
from typing import Optional, Dict, Any
from datetime import datetime

class PDFUpload(Document):
    filename: str
    uploaded_by: str  # user id or email
    extracted_data: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "pdf_uploads" 