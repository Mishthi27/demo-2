import os
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.user import User
from app.models.form import FormSubmission
from app.models.pdf import PDFUpload
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

MONGODB_URI = os.environ["MONGODB_URI"]

async def initiate_database():
    client = AsyncIOMotorClient(MONGODB_URI)

    # Safely extract DB name from URI
    parsed = urlparse(MONGODB_URI)
    db_name = parsed.path[1:] if parsed.path else "test"

    database = client[db_name]
    await init_beanie(
        database=database,
        document_models=[User, FormSubmission, PDFUpload],
    )
