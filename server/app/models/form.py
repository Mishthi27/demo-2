from beanie import Document
from pydantic import Field
from typing import Optional, Dict, Any
from datetime import datetime

class FormSubmission(Document):
    data: Dict[str, Any]
    submitted_by: str  # user id or email
    synced: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "form_submissions" 