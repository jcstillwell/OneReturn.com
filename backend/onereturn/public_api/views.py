from django.shortcuts import render
import string, secrets, os, smtplib
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import status
from django.utils import timezone
from django.db.utils import IntegrityError
from django.core.exceptions import ValidationError
from django.db.models import Q, Count
from userapi.serializers import *

from core.models import Invoice, Item, AppUser, AppUserManager, UnverifiedUser

class CreateInvoice(APIView):

    def post(self, request):
        invoice_data = request.data.get("invoice", None)
        item_data = request.data.get("items", [])

        if invoice_data:
            serialized_invoice = InvoiceSerializer(data=invoice_data)

            if serialized_invoice.is_valid():
                invoice = Invoice.objects.create(**serialized_invoice.data)
                serialized_items = ItemSerializer(data=item_data, many=True)

                if serialized_items.is_valid():
                    for validated_data in serialized_items.data:
                        validated_data['parent'] = invoice
                        item = Item.objects.create(**validated_data)

                    return Response({"success":f"created invoice: {invoice.invoiceID}"}, status=status.HTTP_200_OK)
                else:
                    return Response({"error":"bad request"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error":"bad request"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error":"No invoice data provided"}, status=status.HTTP_400_BAD_REQUEST)