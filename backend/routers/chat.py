from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini_service import chat_with_gemini

router = APIRouter(prefix="/chat", tags=["chat"])


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []


@router.post("/")
async def chat(req: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in req.history]
    response = await chat_with_gemini(req.message, history)
    return {"response": response}
