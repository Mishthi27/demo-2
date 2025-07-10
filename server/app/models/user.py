from beanie import Document
from pydantic import EmailStr, Field
from typing import Literal

class User(Document):
    email: EmailStr
    hashed_password: str
    role: Literal["field_worker", "admin", "analyst"]
    is_active: bool = True

    class Settings:
        name = "users" 