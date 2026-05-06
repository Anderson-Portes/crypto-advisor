import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
from routers import crypto, news, chat

# Encontra o .env na raiz do projeto (sobe os diretórios a partir do cwd)
load_dotenv(find_dotenv(usecwd=True))

app = FastAPI(title="CryptoAdvisor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crypto.router)
app.include_router(news.router)
app.include_router(chat.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "CryptoAdvisor API"}
