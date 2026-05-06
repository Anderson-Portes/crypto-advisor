from fastapi import APIRouter, Query
from services.news_service import get_crypto_news

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/")
async def news(
    query: str = Query(default="cryptocurrency bitcoin ethereum"),
    limit: int = Query(default=8, ge=1, le=20),
):
    articles = await get_crypto_news(query, limit)
    return {"articles": articles, "total": len(articles)}
