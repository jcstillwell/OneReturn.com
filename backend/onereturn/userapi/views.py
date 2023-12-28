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
        invoices = Invoice.objects.filter(sharedWith__uuid=request.user.uuid)
        
        if not invoices:
            return Response({"message": "No invoices have been shared with this user."}, status=status.HTTP_404_NOT_FOUND)

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
        token = request.GET.get('token')
        email = request.GET.get('email')
        method = request.GET.get('method')

        if method == "CHECK":
            try:
                query = AppUser.objects.get(email=email)
                return Response({'status':'OK', 'message':f'Successfully verified {query.email}! please return to previous screen to continue singing in', 'uuid':query.uuid}, status=status.HTTP_200_OK)
            except AppUser.DoesNotExist:
                return Response({'status':'ERROR', 'message':'User has not been verified yet.'})
        else:
            if not token:
                return Response({'status':'ERROR', 'message':'The link you followed may be expired or broken, please try again'})
            else:
                try:
                    try:
                        user = UnverifiedUser.objects.get(token=token)
                        UnverifiedUser.objects.filter(email = user.email).exclude(pk=user.pk).delete()
                        verified_user = AppUser.objects.create_user(
                            uuid=token,
                            email=user.email,
                            emailVerified=True,
                        )
                    except ValidationError:
                        return Response({'status':'ERROR', 'message':'The link you followed may be expired or broken, please try again'})
                    return Response({'status':'OK', 'message':f'the email address {verified_user.email} has been verified'})
                except UnverifiedUser.DoesNotExist:
                    return Response({'status':'ERROR', 'message':'Error verifying user, please try again later.'})    

    
class SendEmail(APIView):
    def post(self, request):
        if request.data:
            source_email = 'jcseagle21@gmail.com'
            email_password = 'vcibcvsaaftekzpp'
            to_email = request.data.get('email', None)
            query = AppUser.objects.filter(email=to_email)
            if len(query) > 0:
                return Response({'status':'ERROR', 'message':'Email already in use'}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                tempUser = UnverifiedUser.objects.create(
                    email=to_email
                )
                verifyEmail(source_email, to_email, email_password, f"https://onereturn.com/verify?token={tempUser.token}")
                return Response({'status':'OK', 'message':f'Message sent to {to_email}, and created temp user {tempUser.token}'}, status=status.HTTP_200_OK)
                

    
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
                    sharedUser = AppUser.objects.get(email = sharedWith)
                    invoice.sharedWith.add(sharedUser)
                    invoice.transactionHistory.append(f'Receipt shared with {sharedUser.email} at {timezone.now()}')
                    print(invoice.transactionHistory)
                    sharedUser.sharedinvoices.add(invoice)
                    invoice.save()
                    sharedUser.save()
                    return Response({'OK':'Updated invoice and user'}, status=status.HTTP_200_OK)
                except Invoice.DoesNotExist:
                    return Response({'ERROR':'No invoice matches query'}, status=status.HTTP_404_NOT_FOUND)
                except AppUser.DoesNotExist:
                    return Response({'ERROR':'user not found'}, status=status.HTTP_404_NOT_FOUND)
                
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
            invoices = Invoice.objects.filter(recipientID=request.user.uuid, invoiceID=query)
            if not invoices:
                return Response({"message": "No invoices have been assigned to this user."}, status=status.HTTP_404_NOT_FOUND)
        else:
            invoices = Invoice.objects.filter(recipientID=request.user.uuid)
            if not invoices:
                return Response({"message": "No invoices have been assigned to this user."}, status=status.HTTP_404_NOT_FOUND)

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
            Q(recipientID=request.user.uuid),
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
                user = AppUser.objects.get(email = email)
                auth = authenticate(request, email=email, password=password)
                if auth is not None:
                    token, created = Token.objects.get_or_create(user=user)
                    user_data = {"email":user.email, "firstName":user.first_name, "password":user.password, "uuid":user.uuid}
                    return Response({"status": "OK", "token" : token.key, "data":user_data})
                else: 
                    return Response({"message":"user not found", "status":"error"}, status=status.HTTP_401_UNAUTHORIZED)
            except AppUser.DoesNotExist:
                return Response({"message":"email not found", "status":"error"}, status=status.HTTP_401_UNAUTHORIZED)

        
class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'message':f'logged out user {request.user.uuid}', 'status':'success'})
        
class RegisterView(APIView):
    def post(self, request):
        if request.data:
            print(request.data)
            serialized_user = UserSerializer(data=request.data)
        if serialized_user.is_valid():
            try:
                user = AppUser.objects.get(uuid=serialized_user.data['uuid'])
                user.first_name = serialized_user.data['first_name']
                user.last_name = serialized_user.data['last_name']
                user.set_password(serialized_user.data['password'])
                user.save()
            except IntegrityError:
                return(Response({"status":"error",'type':'Integrity Error', "message":"Email already is in use."}, status=status.HTTP_401_UNAUTHORIZED))
            return(Response({"success":f"created user {user.uuid}"}))
        else:
            print(serialized_user.errors)
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
                    token, created = token.objects.get_or_create(user=merchant)
                    merchant_data = {'merchant-id':merchant.merchantID, 'merchant-api-key':merchant.merchantAPIKey}
                    if merchant.merchantAPIKey != merchantAPIKey:
                        return Response({'status':'error', 'message':'API key is either invalid or expired, please try again or contact customer support.'})
                    else:
                        return Response({'status':'OK', 'token':token.key, 'data':merchant_data}, status=status.HTTP_200_OK)
                else:
                    return Response({"message":"Merchant ID not associated with account, please try again or contact customer support."}, status=status.HTTP_401_UNAUTHORIZED)
            except MerchantAccount.DoesNotExist:
                return Response({"message":"Merchant ID not associated with account, please try again or contact customer support."}, status=status.HTTP_401_UNAUTHORIZED)
            
class MerchantRegisterViewLead(APIView):

    def post(self, request):
        source_email = 'jcseagle21@gmail.com'
        email_password = 'vcibcvsaaftekzpp'
        if request.data:
            businessName = request.data.get('businessName', None)
            businessAddress = request.data.get('businessAddress', None)
            businessType = request.data.get('businessType', None)
            industry = request.data.get('industry', None)
            primaryContactName = request.data.get('primaryContactName', None)
            primaryPhoneNumber = request.data.get('primaryPhoneNumber', None)
            primaryEmailAddress = request.data.get('primaryEmailAddress', None)
            numRegisters = request.data.get('numRegisters', None)

            merchantInfo = {
                'businessName':businessName,
                'businessAddress':businessAddress,
                'businessType':businessType,
                'industry':industry,
                'primaryContactName':primaryContactName,
                'primaryPhoneNumber':primaryPhoneNumber,
                'primaryEmailAddress':primaryEmailAddress,
                'numRegisters':numRegisters
            }

            tempUser = UnverifiedMerchantAccount.objects.create(
                businessName = businessName,
                businessAddress = businessAddress,
                businessType = businessType,
                industry = industry,
                primaryContactName = primaryContactName,
                primaryPhoneNumber = primaryPhoneNumber,
                primaryEmailAddress = primaryEmailAddress,
                numRegisters = numRegisters,
                dateCreated = timezone.now(),
                temporaryUserID = f'{businessName.strip(" ", "")}'.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8)),
                temporaryPassword = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(16))
            )
            merchantLeadEmail(source_email, 'jcseagle21@gmail.com', email_password, tempUser.confirmationID, merchantInfo, f"https://onereturn.com/userapi/confirmLead?confirmationID={tempUser.confirmationID}")
            return Response({'status':'OK', 'message':f'Thank you! your information has been sent over for review and you can expect to hear back from us within the next 1-2 days, your confirmation ID is: {tempUser.confirmationID}'}, status=status.HTTP_200_OK)
            
class GetMerchantViewInvoice(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.data:
            merchantID = request.data.get('merchantID')
            merchantAPIKey = request.data.get('merchantAPIKey')
