# 1. Usa uma imagem leve do Python 3.11 (Linux)
FROM python:3.11-slim

# 2. Define a pasta de trabalho dentro do container
WORKDIR /app

# 3. Copia o arquivo de dependências primeiro (para usar cache)
COPY requirements.txt .

# 4. Instala as dependências
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copia todo o resto do código para dentro do container
COPY . .

# 6. Expõe a porta 8000
EXPOSE 8000

# 7. Comando para rodar a API quando o container iniciar
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]