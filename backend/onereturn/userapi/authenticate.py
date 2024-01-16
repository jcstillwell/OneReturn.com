import string, secrets, os, smtplib
from email.message import EmailMessage
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.db.models import F
from core.models import APIKey
from rest_framework.response import Response
import twilio
from twilio.rest import Client
import random

#TEMPORARY STORE IN ENV VARIABLE LATER.
twilio_sid = 'AC72e28bc17a6bb1d383f24d7527e29c55'
twilio_auth_token = '90db36cb2a9f631d3aa901120b0f9d09'
client = Client(twilio_sid, twilio_auth_token)

def incrementAPIKeyUsage(api_key):
    try:
        apiKeyInstance = APIKey.objects.get(key=api_key)
        apiKeyInstance.usageThisMonth = F('usageThisMonth') + 1
        apiKeyInstance.save()
        return(f'Incremented API Key: {apiKeyInstance.key} owned by {apiKeyInstance.owner.merchantID}, current usage for this month is {apiKeyInstance.usageThisMonth}')
    except APIKey.DoesNotExist:
         return('API Key not found, please contact support at support@onereturn.com')

def verifyPhoneNumber(phone_number):
    verification_code = random.randit(1000, 9999)

    twilio_phone_number = ''

    message = client.messages.create(
         body=f'Your verification code is: {verification_code}',
         from_=twilio_phone_number,
         to=phone_number
    )

def verifyEmail(source_email, to_email, password, verification_link, method=None):
        
        if method == 'merchant':
            msg = EmailMessage()
            msg['Subject'] = 'This email has been used to sign up for a merchant account at OneReturn.com'
            msg['From'] = source_email
            msg['To'] = to_email

            msg.set_content('Please verify your account by clicking the link: ' + verification_link)

            html_content = f"""
            <html>
            <body>
                <h1>Welcome to OneReturn for Business!</h1>
                <p>Please click the button below to verify your account:</p>
                <a href="{verification_link}" style="background-color: #007BFF; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Verify Account</a>
                <p> If you did not sign up for this service you can ignore and delete this email</p>
            </body>
            </html>
            """

            msg.add_alternative(html_content, subtype='html')

            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(source_email, password)
                server.send_message(msg)
        else:
            msg = EmailMessage()
            msg['Subject'] = 'Verify Your Account'
            msg['From'] = source_email
            msg['To'] = to_email

            msg.set_content('Please verify your account by clicking the link: ' + verification_link)

            html_content = f"""
            <html>
            <body>
                <h1>Welcome to OneReturn!</h1>
                <p>Please click the button below to verify your account:</p>
                <a href="{verification_link}" style="background-color: #007BFF; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Verify Account</a>
                <p> If you did not sign up for this service you can ignore and delete this email</p>
            </body>
            </html>
            """

            msg.add_alternative(html_content, subtype='html')

            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(source_email, password)
                server.send_message(msg)