FROM python:3.9.13-alpine
ENV PYTHONUNBUFFERED 1
WORKDIR /django
COPY requirements.txt requirements.txt
ARG DB_PASSWORD=Cicada3301
ARG DB_NAME=onereturn
ARG DB_USER=postgres
ARG DB_HOST=onereturn.c4jih2f1nvwu.us-east-1.rds.amazonaws.com
ARG DB_PORT=5432
RUN pip3 install -r requirements.txt
COPY . .