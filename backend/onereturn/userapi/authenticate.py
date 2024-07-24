import string, secrets, os, smtplib
from email.message import EmailMessage
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.db.models import F
from core.models import APIKey
from rest_framework.response import Response
from dotenv import load_dotenv
import boto3
import random
from botocore.exceptions import ClientError


#This file was named at the beginning of the project when I had no idea what I was doing and now I dont want to find everywhere it is referenced.
#really should call this communications.py or something, maybe one day.

#removes old env vars
os.environ.pop('AWS_ACCESS_KEY_ID', None)
os.environ.pop('AWS_SECRET_ACCESS_KEY', None)
os.environ.pop('AWS_REGION', None)

load_dotenv()

AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
print(AWS_SECRET_ACCESS_KEY)

session = boto3.Session(
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    region_name=os.environ['AWS_REGION']
)
ses_client = boto3.client('ses', region_name=os.environ['AWS_REGION'])

def incrementAPIKeyUsage(api_key):
    try:
        apiKeyInstance = APIKey.objects.get(key=api_key)
        apiKeyInstance.usageThisMonth = F('usageThisMonth') + 1
        apiKeyInstance.save()
        return(f'Incremented API Key: {apiKeyInstance.key} owned by {apiKeyInstance.owner.merchantID}, current usage for this month is {apiKeyInstance.usageThisMonth}')
    except APIKey.DoesNotExist:
         return('API Key not found, please contact support at support@onereturn.com')

def confirmationEmail(source_email, to_email, merchantID, merchantAPIKey):
    subject = 'Welcome! Please take careful note of the following credentials and delete this email'

    html_content = f"""
            <html>
            <body>
                <h1>Welcome to OneReturn for business!</h1>
                <p>Here are your login credentials and API Key:</p>
                <p>Merchant ID: {merchantID}</p>
                <p>API Key: {merchantAPIKey}</p>
            </body>
            </html>
            """

    try:
        response = ses_client.send_email(
                Destination={
                      'ToAddresses': [to_email],
                },
                Message={
                    'Body': {
                        'Html': {
                        'Charset': "UTF-8",
                        'Data': html_content,
                    },
                        'Text': {
                        'Charset': "UTF-8",
                        'Data': '',
                    },
                },
                    'Subject': {
                    'Charset': "UTF-8",
                    'Data': subject,
                },
            },
            Source=source_email
        )
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        print("Email sent")


def verifyEmail(source_email, to_email, verification_link, method=None):
        
        if method == 'merchant':
            subject = 'This email has been used to sign up for a merchant account at OneReturn.com'
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

        else:
            subject = 'Verify Your Account'
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

        body_text = f"Please verify your account by clicking the link: {verification_link}"

        try:
            response = ses_client.send_email(
                Destination={
                      'ToAddresses': [to_email],
                },
                Message={
                    'Body': {
                        'Html': {
                            'Charset': "UTF-8",
                            'Data': html_content,
                        },
                        'Text': {
                            'Charset': "UTF-8",
                            'Data': body_text,
                        },
                    },
                    'Subject': {
                        'Charset': "UTF-8",
                        'Data': subject,
                    },
                },
                Source=source_email
            )
        except ClientError as e:
            print(e.response['Error']['Message'])
        else:
            print("Email sent")
