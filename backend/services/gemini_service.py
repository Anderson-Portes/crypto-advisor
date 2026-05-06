import os
import google.generativeai as genai

SYSTEM_PROMPT = """Você é CryptoAdvisor, um assistente especializado em criptomoedas.
Suas responsabilidades:
- Explicar conceitos de blockchain, DeFi, NFTs e criptomoedas de forma clara
- Analisar tendências de mercado com base em dados disponíveis
- Fornecer dicas educacionais sobre como investir com segurança
- Responder perguntas sobre moedas específicas (Bitcoin, Ethereum, etc.)
- Alertar sobre riscos e a importância de diversificação

Regras importantes:
- Nunca forneça conselhos financeiros específicos como "compre X agora"
- Sempre ressalte que o mercado cripto é volátil e arriscado
- Responda em português brasileiro
- Seja objetivo e informativo
- Mantenha respostas concisas mas completas"""


def get_model():
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=SYSTEM_PROMPT,
    )


async def chat_with_gemini(message: str, history: list[dict]) -> str:
    model = get_model()
    if not model:
        return (
            "⚠️ Gemini API não configurada. Adicione GEMINI_API_KEY no arquivo .env do backend.\n\n"
            "Para obter uma chave gratuita, acesse: https://aistudio.google.com/app/apikey"
        )

    formatted_history = []
    for msg in history[-10:]:
        role = "user" if msg["role"] == "user" else "model"
        formatted_history.append({"role": role, "parts": [msg["content"]]})

    chat = model.start_chat(history=formatted_history)
    response = chat.send_message(message)
    return response.text
