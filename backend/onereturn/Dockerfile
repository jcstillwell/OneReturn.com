FROM python:3.9.13-alpine
ENV PYTHONUNBUFFERED 1
WORKDIR /django
COPY requirements.txt requirements.txt
ARG DB_PASSWORD=Cicada3301
ARG DB_NAME=onereturn
ARG DB_USER=postgres
ARG DB_HOST=onereturn.c4jih2f1nvwu.us-east-1.rds.amazonaws.com
ARG DB_PORT=5432
ARG AWS_ACCESS_KEY_ID=AKIA2ALIXEMGRLBQELFO
ARG AWS_SECRET_ACCESS_KEY=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
ARG AWS_REGION=us-east-1
ARG REACT_APP_API_FRONTEND='https://api.onereturn.com'
ARG REACT_APP_MERCHANT_FRONTEND='https://console.onereturn.com'
ARG REACT_APP_FRONTEND='https://onereturn.com'
ARG REACT_APP_BACKEND='https://onereturn.com/userapi'
ENV REACT_APP_API_FRONTEND=$REACT_APP_API_FRONTEND
ENV REACT_APP_MERCHANT_FRONTEND=$REACT_APP_MERCHANT_FRONTEND
ENV REACT_APP_FRONTEND=$REACT_APP_FRONTEND
ENV REACT_APP_BACKEND=$REACT_APP_BACKEND
RUN pip3 install -r requirements.txt
COPY . .