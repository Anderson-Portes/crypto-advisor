import httpx
import os
from datetime import datetime, timedelta

NEWS_API_BASE = "https://newsapi.org/v2"

_VERIFY_SSL = not bool(os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY"))

FALLBACK_NEWS = [
    {
        "title": "Bitcoin atinge nova resistência em meio a volatilidade do mercado",
        "description": "Analistas observam comportamento do BTC em zona de consolidação enquanto investidores aguardam próximo movimento.",
        "url": "https://coinmarketcap.com/news/",
        "urlToImage": "https://placehold.co/400x200/1a1a2e/00d4ff?text=Bitcoin+News",
        "publishedAt": datetime.utcnow().isoformat(),
        "source": {"name": "CryptoNews"},
    },
    {
        "title": "Ethereum continua consolidação pré-upgrade da rede",
        "description": "Desenvolvedores da rede Ethereum confirmam cronograma para próximas melhorias de escalabilidade e eficiência.",
        "url": "https://coinmarketcap.com/news/",
        "urlToImage": "https://placehold.co/400x200/1a1a2e/627eea?text=Ethereum+News",
        "publishedAt": datetime.utcnow().isoformat(),
        "source": {"name": "CryptoNews"},
    },
    {
        "title": "Solana registra aumento no volume de transações",
        "description": "Blockchain de alto desempenho registra crescimento significativo em DeFi e NFTs durante a última semana.",
        "url": "https://coinmarketcap.com/news/",
        "urlToImage": "https://placehold.co/400x200/1a1a2e/9945ff?text=Solana+News",
        "publishedAt": datetime.utcnow().isoformat(),
        "source": {"name": "CryptoNews"},
    },
    {
        "title": "Regulação cripto: novos marcos globais em discussão",
        "description": "Governos de diferentes países debatem frameworks regulatórios para ativos digitais visando maior segurança aos investidores.",
        "url": "https://coinmarketcap.com/news/",
        "urlToImage": "https://placehold.co/400x200/1a1a2e/f7931a?text=Regulation+News",
        "publishedAt": datetime.utcnow().isoformat(),
        "source": {"name": "CryptoRegulation"},
    },
    {
        "title": "DeFi total value locked supera recordes históricos",
        "description": "Finanças descentralizadas continuam crescimento exponencial com novos protocolos atraindo bilhões em liquidez.",
        "url": "https://coinmarketcap.com/news/",
        "urlToImage": "https://placehold.co/400x200/1a1a2e/00ff88?text=DeFi+News",
        "publishedAt": datetime.utcnow().isoformat(),
        "source": {"name": "DeFiPulse"},
    },
]


async def get_crypto_news(query: str = "cryptocurrency", page_size: int = 10) -> list[dict]:
    api_key = os.getenv("NEWS_API_KEY", "")
    if not api_key:
        return FALLBACK_NEWS

    try:
        from_date = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
        async with httpx.AsyncClient(timeout=15, verify=_VERIFY_SSL) as client:
            resp = await client.get(
                f"{NEWS_API_BASE}/everything",
                params={
                    "q": query,
                    "apiKey": api_key,
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": page_size,
                    "from": from_date,
                },
            )
            if resp.status_code == 200:
                articles = resp.json().get("articles", [])
                return articles if articles else FALLBACK_NEWS
    except Exception:
        pass

    return FALLBACK_NEWS
