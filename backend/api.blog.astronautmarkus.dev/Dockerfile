FROM python:3.13.2-slim
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 5001
CMD ["gunicorn", "-b", "0.0.0.0:5001", "wsgi:app"]