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

from core.models import Invoice, Item, AppUser, AppUserManager, UnverifiedUser, MerchantAccount, APIKey

class CreateInvoice(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        invoice_data = request.data.get("invoice", None)
        item_data = request.data.get("items", [])
        given_key = request.data.get("api_key", None).strip("'\"")
        merchant_account = request.user.merchant_profile
        self.isValid = False

        try: 
            #searches and returns list of APIKey objs assoc with account and checks if any exist.
            api_key = APIKey.objects.filter(owner__user__uuid=merchant_account.user.uuid)
            if api_key.count() > 0:
                    #iterates through keys to see if any match the key passed by user and if one does, sets isValid to true.
                    for key in api_key:
                        if str(key.key) == given_key:
                            self.isValid = True
                    if self.isValid:
                        if invoice_data:
                            serialized_invoice = InvoiceSerializer(data=invoice_data)
                            if serialized_invoice.is_valid():
                                invoice = Invoice.objects.create(**serialized_invoice.data)
                                serialized_items = ItemSerializer(data=item_data, many=True)
                                #Checks if request is properly formatted.
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
                    else:
                        return Response({'ERROR':'API key is either invalid or expired please contact customer support at support@onereturn.com'}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                raise Exception("No API key associated with account")
        except AttributeError:
            print("here 1")
            return Response({'ERROR':'You are not accessing this endpoint from a registered merchant account'}, status=status.HTTP_401_UNAUTHORIZED)