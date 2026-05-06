FROM python:3.13-slim

WORKDIR /app

# Proxy corporativo passado em build-time
ARG HTTP_PROXY
ARG HTTPS_PROXY
ENV HTTP_PROXY=$HTTP_PROXY
ENV HTTPS_PROXY=$HTTPS_PROXY

COPY requirements.txt .

# --trusted-host ignora falha de SSL do proxy corporativo
RUN pip install --no-cache-dir \
    --trusted-host pypi.org \
    --trusted-host pypi.python.org \
    --trusted-host files.pythonhosted.org \
    -r requirements.txt

# Remove proxy do ambiente de runtime (não necessário em execução)
ENV HTTP_PROXY="" HTTPS_PROXY=""

COPY . .

EXPOSE ${PORT:-8000}

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
