FROM python:3-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV FLASK_APP=app.py
CMD ["sh", "-c", "pip install --no-cache-dir -r requirements.txt && python app.py"]
