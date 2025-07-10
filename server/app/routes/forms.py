from fastapi import APIRouter, Depends, HTTPException, status
from app.models.form import FormSubmission
from typing import List
from app.main import get_current_user, security

router = APIRouter()

@router.post("/sync", response_model=dict, dependencies=[Depends(security)])
async def sync_forms(forms: List[dict], user=Depends(get_current_user)):
    if user.get("role") not in ["field_worker", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    saved = 0
    errors = []
    for form in forms:
        try:
            submission = FormSubmission(
                data=form,
                submitted_by=user["sub"],
                synced=True
            )
            await submission.insert()
            saved += 1
        except Exception as e:
            errors.append(str(e))
    return {"message": "Forms synced", "saved": saved, "errors": errors} 