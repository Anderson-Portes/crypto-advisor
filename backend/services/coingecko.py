import asyncio
import os
import time
import httpx

BASE_URL = "https://api.coingecko.com/api/v3"

# Proxy corporativo intercepta SSL — desabilita verificação quando proxy está ativo
_VERIFY_SSL = not bool(os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY"))


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=20, verify=_VERIFY_SSL)

COIN_IDS = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "BNB": "binancecoin",
    "SOL": "solana",
    "ADA": "cardano",
    "XRP": "ripple",
    "DOGE": "dogecoin",
    "DOT": "polkadot",
    "MATIC": "matic-network",
    "AVAX": "avalanche-2",
}

# TTL em segundos para cada tipo de dado
_CACHE_TTL = {
    "markets": 60,
    "global": 120,
    "trending": 300,
    "chart": 300,
}

_cache: dict[str, tuple[float, object]] = {}


def _get_cache(key: str, ttl: int):
    if key in _cache:
        ts, data = _cache[key]
        if time.time() - ts < ttl:
            return data
    return None


def _set_cache(key: str, data: object):
    _cache[key] = (time.time(), data)


async def _get(client: httpx.AsyncClient, url: str, params: dict) -> httpx.Response:
    """Faz a requisição com retry automático em caso de rate limit (429)."""
    for attempt in range(3):
        resp = await client.get(url, params=params)
        if resp.status_code == 429:
            wait = 2 ** attempt + 1  # 2s, 3s, 5s
            await asyncio.sleep(wait)
            continue
        return resp
    resp.raise_for_status()
    return resp


async def get_market_data(coin_ids: list[str], vs_currency: str = "usd") -> list[dict]:
    cache_key = f"markets:{','.join(sorted(coin_ids))}:{vs_currency}"
    cached = _get_cache(cache_key, _CACHE_TTL["markets"])
    if cached is not None:
        return cached  # type: ignore

    async with _client() as client:
        resp = await _get(client, f"{BASE_URL}/coins/markets", {
            "vs_currency": vs_currency,
            "ids": ",".join(coin_ids),
            "order": "market_cap_desc",
            "per_page": 20,
            "page": 1,
            "sparkline": True,
            "price_change_percentage": "1h,24h,7d",
        })
        resp.raise_for_status()
        data = resp.json()
        _set_cache(cache_key, data)
        return data


async def get_global_stats() -> dict:
    cached = _get_cache("global", _CACHE_TTL["global"])
    if cached is not None:
        return cached  # type: ignore

    async with _client() as client:
        resp = await _get(client, f"{BASE_URL}/global", {})
        resp.raise_for_status()
        data = resp.json().get("data", {})
        _set_cache("global", data)
        return data


async def get_trending() -> list[dict]:
    cached = _get_cache("trending", _CACHE_TTL["trending"])
    if cached is not None:
        return cached  # type: ignore

    async with _client() as client:
        resp = await _get(client, f"{BASE_URL}/search/trending", {})
        resp.raise_for_status()
        coins = [c["item"] for c in resp.json().get("coins", [])]
        _set_cache("trending", coins)
        return coins


async def get_fear_greed() -> dict:
    cached = _get_cache("fear_greed", 3600)
    if cached is not None:
        return cached  # type: ignore

    async with _client() as client:
        resp = await client.get("https://api.alternative.me/fng/", params={"limit": 1})
        resp.raise_for_status()
        items = resp.json().get("data", [{}])
        d = items[0] if items else {}
        result = {
            "value": int(d.get("value", 50)),
            "classification": d.get("value_classification", "Neutral"),
        }
        _set_cache("fear_greed", result)
        return result


async def get_coin_chart(coin_id: str, days: int = 7, vs_currency: str = "usd") -> dict:
    cache_key = f"chart:{coin_id}:{days}:{vs_currency}"
    cached = _get_cache(cache_key, _CACHE_TTL["chart"])
    if cached is not None:
        return cached  # type: ignore

    async with _client() as client:
        resp = await _get(client, f"{BASE_URL}/coins/{coin_id}/market_chart", {
            "vs_currency": vs_currency,
            "days": days,
            "interval": "daily" if days > 1 else "hourly",
        })
        resp.raise_for_status()
        data = resp.json()
        _set_cache(cache_key, data)
        return data
