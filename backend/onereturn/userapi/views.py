import string, secrets, os, smtplib
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import status
from .authenticate import *
from django.utils import timezone
from django.db.utils import IntegrityError
from django.core.exceptions import ValidationError
from django.db.models import Q, Count

from core.models import *
from .serializers import *

class GetShared(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invoices = Invoice.objects.filter(sharedWith__uuid=request.account.uuid)
        
        if not invoices:
            return Response({"message": "No invoices have been shared with this account."}, status=status.HTTP_404_NOT_FOUND)

        invoice_list = []
        for invoice in invoices:
            serialized_invoice = InvoiceSerializer(invoice)
            items = Item.objects.filter(parent=invoice)
            serialized_items = ItemSerializer(items, many=True)
            invoice_list.append({
                'invoice': serialized_invoice.data,
                'items': serialized_items.data
            })

        return Response({"invoices":invoice_list})
    
class Verify(APIView):

    def get(self, request):
        email = request.GET.get('email')
        try:
                query = AppUser.objects.get(email=email)
                return Response({'status':'OK', 'message':f'Successfully verified {query.email}! please return to previous screen to continue singing in', 'uuid':query.uuid}, status=status.HTTP_200_OK)
        except AppUser.DoesNotExist:
                return Response({'status':'ERROR', 'message':'account has not been verified yet.'}) 
    def post(self, request):
        if request.data:
            token = request.data.get('token', None)
            if not token:
                return Response({'status':'ERROR', 'message':'The link you followed may be expired or broken, please try again'})
            else:
                try:
                    try:
                        account = UnverifiedUser.objects.get(token=token)
                        UnverifiedUser.objects.filter(email = account.email).exclude(pk=account.pk).delete()
                        verified_account = AppUser.objects.create_account(
                            uuid=token,
                            email=account.email,
                            emailVerified=True,
                        )
                    except ValidationError:
                        return Response({'status':'ERROR', 'message':'The link you followed may be expired or broken, please try again'})
                    return Response({'status':'OK', 'message':f'the email address {verified_account.email} has been verified'})
                except UnverifiedUser.DoesNotExist:
                    return Response({'status':'ERROR', 'message':'Error verifying account, please try again later.'})
        else:
            return Response({'status':'ERROR', 'message':'No token received from client, please reload and try again.'})

    
class SendEmail(APIView):
    def post(self, request):
        if request.data:
            source_email = 'jcseagle21@gmail.com'
            email_password = 'vcibcvsaaftekzpp'
            method = request.data.get('method', None)
            to_email = request.data.get('email', None)

            if method == 'merchant':
                query = MerchantAccount.objects.filter(primaryEmailAddress=to_email)
                if len(query) > 0:
                    return Response({'status':'ERROR', 'message':'Email already in use'}, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    tempMerchantAccount = UnverifiedMerchantAccount.objects.create(
                        email=to_email
                    )
                    verifyEmail(source_email, to_email, email_password, f"https://onereturn.com/verifyMerchant?token={tempMerchantAccount.token}",'merchant')
                    return Response({'status':'OK', 'message':f'Message sent to {to_email}, and created temp account {tempMerchantAccount.token}'}, status=status.HTTP_200_OK)
            else:
                query = AppUser.objects.filter(email=to_email)
                if len(query) > 0:
                    return Response({'status':'ERROR', 'message':'Email already in use'}, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    tempaccount = UnverifiedUser.objects.create(
                        email=to_email
                    )
                    verifyEmail(source_email, to_email, email_password, f"https://onereturn.com/verify?token={tempaccount.token}")
                    return Response({'status':'OK', 'message':f'Message sent to {to_email}, and created temp account {tempaccount.token}'}, status=status.HTTP_200_OK)
                

    
class EditInvoice(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print(request.data)
        if request.data:
            invoiceID = request.data.get('invoiceID')
            recipientID = request.data.get('recipientID')
            action = request.data.get('action')
            sharedWith = request.data.get('sharedWith')
            returner = request.data.get('returner')
            itemName = request.data.get('itemName')
            if action == 'FLAG':
                try:
                    invoice = Invoice.objects.get(Q(recipientID = recipientID) & Q(invoiceID = invoiceID))
                    invoice.flagged = not invoice.flagged
                    invoice.save()
                    return Response({'OK':f'Updated invoice {invoice.invoiceID}'})
                except Invoice.DoesNotExist:
                    return Response({'ERROR':'No invoice matches query'}, status=status.HTTP_404_NOT_FOUND)
            elif action == 'DELETE':
                try:
                    invoice = Invoice.objects.get(Q(recipientID = recipientID) & Q(invoiceID = invoiceID))
                    invoice.delete()
                    return Response({'OK':f'Deleted invoice {Invoice.invoiceID}'})
                except invoice.DoesNotExist:
                    return Response({'ERROR':'No invoice matches query'}, status=status.HTTP_404_NOT_FOUND)

            elif action == 'SHARE':
                try:
                    invoice = Invoice.objects.get(Q(recipientID = recipientID) & Q(invoiceID = invoiceID))
                    sharedaccount = AppUser.objects.get(email = sharedWith)
                    invoice.sharedWith.add(sharedaccount)
                    invoice.transactionHistory.append(f'Receipt shared with {sharedaccount.email} at {timezone.now()}')
                    print(invoice.transactionHistory)
                    sharedaccount.sharedinvoices.add(invoice)
                    invoice.save()
                    sharedaccount.save()
                    return Response({'OK':'Updated invoice and account'}, status=status.HTTP_200_OK)
                except Invoice.DoesNotExist:
                    return Response({'ERROR':'No invoice matches query'}, status=status.HTTP_404_NOT_FOUND)
                except AppUser.DoesNotExist:
                    return Response({'ERROR':'account not found'}, status=status.HTTP_404_NOT_FOUND)
                
            elif action == 'RETURN':
                #temporary for testing purposes
                try:
                    item = Item.objects.get(parent__invoiceID=invoiceID, name=itemName)
                    invoice = Invoice.objects.get(invoiceID = invoiceID)
                    if not item.returned:
                        item.returned = True
                        item.returnedBy = returner
                        invoice.transactionHistory.append(f'Line item {item.name} returned by {returner}({AppUser.objects.get(uuid=returner)}) at {timezone.now()}')
                        print(invoice.transactionHistory)
                        invoice.save()
                        item.save()
                        return Response({"status":"OK", "message":f"Updated return status of item, refunded {item.price} back to the card ending in {item.cardInfo}"})
                    else:
                        return Response({'status':'ERROR', 'message':'item has already been returned.'})
                except Item.DoesNotExist:
                    return Response({"error":"there was an issue retrieving item data, try again."})

class GetInvoice(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('query')
        type = request.query_params.get('type')
        invoice_list = []
        if type == 'SINGLE':
            invoices = Invoice.objects.filter(recipientID=request.account.uuid, invoiceID=query)
            if not invoices:
                return Response({"message": "No invoices have been assigned to this account."}, status=status.HTTP_404_NOT_FOUND)
        else:
            invoices = Invoice.objects.filter(recipientID=request.account.uuid)
            if not invoices:
                return Response({"message": "No invoices have been assigned to this account."}, status=status.HTTP_404_NOT_FOUND)

        for invoice in invoices:
            serialized_invoice = InvoiceSerializer(invoice)
            items = Item.objects.filter(parent=invoice)
            serialized_items = ItemSerializer(items, many=True)
            invoice_list.append({
                'invoice': serialized_invoice.data,
                'items': serialized_items.data
            })

        return Response({"invoices":invoice_list})

      
class ChangeSettings(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        pass
    

class SearchReceipt(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('query')
        print(query)
        invoices = Invoice.objects.filter(
            Q(recipientID=request.account.uuid),
            Q(merchantID__startswith = query) |
            Q(merchantID__icontains = query) |
            Q(invoiceID__startswith = query) |
            Q(merchantAddress__startswith = query) |
            Q(merchantAddress__icontains = query) |
            Q(cards_used__icontains = query) |
            Q(item__name__startswith=query) |
            Q(item__name__icontains=query) |
            Q(item__itemCategory__startswith=query) |
            Q(item__itemCategory__icontains=query)
            ).distinct()
        invoice_list = []
        for invoice in invoices:
            serialized_invoice = InvoiceSerializer(invoice)
            items = Item.objects.filter(parent=invoice)
            serialized_items = ItemSerializer(items, many=True)
            invoice_list.append({
                'invoice': serialized_invoice.data,
                'items': serialized_items.data
            })

        return Response({"invoices":invoice_list})


class AuthenticateView(APIView):
    def post(self, request):
        if request.data:
            email = request.data.get('email', None)
            password = request.data.get('password', None)
            try:
                account = AppUser.objects.get(email = email)
                auth = authenticate(request, email=email, password=password)
                if auth is not None:
                    token, created = Token.objects.get_or_create(account=account)
                    account_data = {"email":account.email, "firstName":account.first_name, "password":account.password, "uuid":account.uuid}
                    return Response({"status": "OK", "token" : token.key, "data":account_data})
                else: 
                    return Response({"message":"account not found", "status":"error"}, status=status.HTTP_401_UNAUTHORIZED)
            except AppUser.DoesNotExist:
                return Response({"message":"email not found", "status":"error"}, status=status.HTTP_401_UNAUTHORIZED)

        
class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(account=request.account).delete()
        return Response({'message':f'logged out account {request.account.uuid}', 'status':'success'})
        
class RegisterView(APIView):
    def post(self, request):
        if request.data:
            print(request.data)
            serialized_account = UserSerializer(data=request.data)
        if serialized_account.is_valid():
            try:
                account = AppUser.objects.get(uuid=serialized_account.data['uuid'])
                account.first_name = serialized_account.data['first_name']
                account.last_name = serialized_account.data['last_name']
                account.set_password(serialized_account.data['password'])
                account.save()
            except IntegrityError:
                return(Response({"status":"error",'type':'Integrity Error', "message":"Email already is in use."}, status=status.HTTP_401_UNAUTHORIZED))
            return(Response({"success":f"created account {account.uuid}"}))
        else:
            print(serialized_account.errors)
            return(Response({"error":"bad request"}))
        

#MERCHANT CLASSES:
        
class MerchantAuthenticateView(APIView):
    def post(self, request):
        if request.data:
            merchantID = request.data.get('merchantID', None)
            merchantAPIKey = request.data.get('merchantAPIKey', None)
            merchantMasterPassword = request.data.get('merchantMasterPassword', None)
            try:
                merchant = MerchantAccount.objects.get(merchantID = merchantID)
                auth = authenticate(request, merchantID=merchantID, password=merchantMasterPassword)
                if auth is not None:
                    token, created = token.objects.get_or_create(account=merchant)
                    merchant_data = {'merchant-id':merchant.merchantID, 'merchant-api-key':merchant.merchantAPIKey}
                    if merchant.merchantAPIKey != merchantAPIKey:
                        return Response({'status':'error', 'message':'API key is either invalid or expired, please try again or contact customer support.'})
                    else:
                        return Response({'status':'OK', 'token':token.key, 'data':merchant_data}, status=status.HTTP_200_OK)
                else:
                    return Response({"message":"Merchant ID not associated with account, please try again or contact customer support."}, status=status.HTTP_401_UNAUTHORIZED)
            except MerchantAccount.DoesNotExist:
                return Response({"message":"Merchant ID not associated with account, please try again or contact customer support."}, status=status.HTTP_401_UNAUTHORIZED)
            
class MerchantRegisterView(APIView):

    def post(self, request):
        if request.data:
            print(request.data)
            serialized_account = MerchantAccountSerializer(data=request.data)
        if serialized_account.is_valid():
            try:
                account = MerchantAccount.objects.get(uuid=serialized_account.data['uuid'])
                account.merchantID = serialized_account.data['merchantID']
                account.set_password(serialized_account.data['merchantMasterPassword'])
                account.businessName = serialized_account.data['businessName']
                account.businessAddress = serialized_account.data['businessAddress']
                account.businessType = serialized_account.data['businessType']
                account.industry = serialized_account.data['industry']
                account.primaryContactName = serialized_account.data['primaryContactName']
                account.primaryPhoneNumber = serialized_account.data['primaryPhoneNumber']
                account.numRegisters = serialized_account.data['numRegisters']
                account.save()
            except IntegrityError:
                return(Response({"status":"error",'type':'Integrity Error', "message":"Email already is in use."}, status=status.HTTP_401_UNAUTHORIZED))
            return(Response({"success":f"created account {account.uuid}"}))
        else:
            print(serialized_account.errors)
            return(Response({"error":"bad request"}))

class VerifyMerchant(APIView):

    def get(self, request):
        email = request.GET.get('primaryEmail')
        try:
                query = MerchantAccount.objects.get(primaryEmailAddress=email)
                return Response({'status':'OK', 'message':f'Successfully verified {query.email}! please return to previous screen to continue singing up', 'uuid':query.uuid}, status=status.HTTP_200_OK)
        except MerchantAccount.DoesNotExist:
                return Response({'status':'ERROR', 'message':'Account has not been verified yet.'}) 
    def post(self, request):
        if request.data:
            token = request.data.get('token', None)
            if not token:
                return Response({'status':'ERROR', 'message':'The link you followed may be expired or broken, please try again.'})
            else:
                try:
                    try:
                        account = UnverifiedMerchantAccount.objects.get(token=token)
                        UnverifiedMerchantAccount.objects.filter(email = account.email).exclude(pk=account.pk).delete()
                        verified_account = MerchantAccount.objects.create_user(
                            uuid=token,
                            primaryEmailAddress=account.email,
                        )
                    except ValidationError:
                        return Response({'status':'ERROR', 'message':'The link you followed may be expired or broken, please try again.'})
                    return Response({'status':'OK', 'message':f'the email address {verified_account.primaryEmailAddress} has been verified.'})
                except UnverifiedMerchantAccount.DoesNotExist:
                    return Response({'status':'ERROR', 'message':'Error verifying account, please try again later.'})
        else:
            return Response({'status':'ERROR', 'message':'No token received from client, please reload and try again.'})
            
class GetMerchantViewInvoice(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.data:
            merchantID = request.data.get('merchantID')
            merchantAPIKey = request.data.get('merchantAPIKey')