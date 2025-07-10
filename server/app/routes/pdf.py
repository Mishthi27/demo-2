from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.main import get_current_user, security
from app.models.pdf import PDFUpload
from app.services.pdf.extractor import extract_pdf_data
import os
import shutil
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "uploaded_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=dict, dependencies=[Depends(security)])
async def upload_pdf(file: UploadFile = File(...), user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        # Save file to disk
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        # Extract data (stub)
        extracted = extract_pdf_data(file_path)
        # Save to DB
        pdf_doc = PDFUpload(
            filename=filename,
            uploaded_by=user["sub"],
            extracted_data=extracted["data"]
        )
        await pdf_doc.insert()
        return {"message": "PDF uploaded and processed", "filename": filename, "extracted": extracted["data"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 