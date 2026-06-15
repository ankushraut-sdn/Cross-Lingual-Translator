from fastapi import APIRouter
from pydantic import BaseModel
from app.services.translate_cross_lingual import TranslationService

class TranslationRequest(BaseModel):
    text: str
    target_lang: str

router = APIRouter()
@router.post("/run")
async def run_api(req: TranslationRequest):
    return {"success": True, "result": TranslationService().execute(req.text, req.target_lang)}