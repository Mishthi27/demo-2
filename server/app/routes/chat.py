from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.main import get_current_user, security
from app.services.chatbot.resolver import resolve_query

router = APIRouter()

class ChatQuery(BaseModel):
    query: str

@router.post("/query", response_model=dict, dependencies=[Depends(security)])
async def chat_query(payload: ChatQuery, user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        ai_response = await resolve_query(payload.query, user.get("role"))
        return {"message": "AI response", "response": ai_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 