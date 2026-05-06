import httpx
from fastapi import APIRouter, Query, HTTPException
from services.coingecko import get_market_data, get_global_stats, get_trending, get_coin_chart, COIN_IDS

router = APIRouter(prefix="/crypto", tags=["crypto"])

DEFAULT_COINS = list(COIN_IDS.values())


def _handle_error(e: Exception) -> HTTPException:
    if isinstance(e, httpx.HTTPStatusError):
        if e.response.status_code == 429:
            return HTTPException(status_code=429, detail="CoinGecko rate limit atingido. Tente novamente em instantes.")
        return HTTPException(status_code=502, detail=f"CoinGecko retornou {e.response.status_code}")
    if isinstance(e, httpx.TimeoutException):
        return HTTPException(status_code=504, detail="CoinGecko não respondeu a tempo.")
    return HTTPException(status_code=502, detail=str(e))


@router.get("/markets")
async def markets(
    coins: str = Query(default=",".join(DEFAULT_COINS[:10])),
    currency: str = Query(default="usd"),
):
    try:
        coin_list = [c.strip() for c in coins.split(",") if c.strip()]
        data = await get_market_data(coin_list, currency)
        return {"data": data, "currency": currency}
    except Exception as e:
        raise _handle_error(e)


@router.get("/global")
async def global_stats():
    try:
        return await get_global_stats()
    except Exception as e:
        raise _handle_error(e)


@router.get("/trending")
async def trending():
    try:
        return {"coins": await get_trending()}
    except Exception as e:
        raise _handle_error(e)


@router.get("/chart/{coin_id}")
async def chart(
    coin_id: str,
    days: int = Query(default=7, ge=1, le=365),
    currency: str = Query(default="usd"),
):
    try:
        return await get_coin_chart(coin_id, days, currency)
    except Exception as e:
        raise _handle_error(e)


@router.get("/coins")
async def available_coins():
    return {"coins": [{"symbol": k, "id": v} for k, v in COIN_IDS.items()]}
