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
from dotenv import load_dotenv

load_dotenv() 

BACKEND = os.environ.get('REACT_APP_BACKEND')
USER_FRONTEND = os.environ.get('REACT_APP_USER_FRONTEND')
MERCHANT_FRONTEND = os.environ.get('REACT_APP_MERCHANT_FRONTEND')
API_FRONTEND = os.environ.get('REACT_APP_API_FRONTEND')

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
        email = request.GET.get('email')
        try:
                query = AppUser.objects.get(email=email)
                return Response({'status':'OK', 'message':f'Successfully verified {query.email}! please return to previous screen to continue signing in', 'uuid':query.uuid}, status=status.HTTP_200_OK)
        except AppUser.DoesNotExist:
                return Response({'status':'ERROR', 'message':'user has not been verified yet.'}) 
    def post(self, request):
        if request.data:
            token = request.data.get('token', None)
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
                query = MerchantAccount.objects.filter(user__email=to_email)
                if len(query) > 0:
                    return Response({'status':'ERROR', 'message':'Email already in use'}, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    tempMerchantAccount = UnverifiedMerchantAccount.objects.create(
                        email=to_email
                    )
                    print(MERCHANT_FRONTEND)
                    verifyEmail(source_email, to_email, email_password, f"{MERCHANT_FRONTEND}/VerifyMerchant?token={tempMerchantAccount.token}",'merchant')
                    return Response({'status':'OK', 'message':f'Message sent to {to_email}, and created temp user {tempMerchantAccount.token}'}, status=status.HTTP_200_OK)
            if method == 'merchant_confirmation':
                pass
            else:
                query = AppUser.objects.filter(email=to_email)
                if len(query) > 0:
                    return Response({'status':'ERROR', 'message':'Email already in use'}, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    tempuser = UnverifiedUser.objects.create(
                        email=to_email
                    )
                    verifyEmail(source_email, to_email, email_password, f"{BACKEND}/verify?token={tempuser.token}")
                    return Response({'status':'OK', 'message':f'Message sent to {to_email}, and created temp user {tempuser.token}'}, status=status.HTTP_200_OK)
                

    
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
                    shareduser = AppUser.objects.get(email = sharedWith)
                    invoice.sharedWith.add(shareduser)
                    invoice.transactionHistory.append(f'Receipt shared with {shareduser.email} at {timezone.now()}')
                    print(invoice.transactionHistory)
                    shareduser.sharedinvoices.add(invoice)
                    invoice.save()
                    shareduser.save()
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
        query = request.GET.get('query')
        method = request.GET.get('method')
        invoice_list = []
        print(method)
        print(query)
        if method == 'SINGLE':
            invoice = Invoice.objects.filter(recipientID=request.user.uuid, invoiceID=query).first()
            print("1")
            if not invoice:
                return Response({"message": "No invoices have been assigned to this user."}, status=status.HTTP_404_NOT_FOUND)
            serialized_invoice = InvoiceSerializer(invoice)
            items = Item.objects.filter(parent=invoice)
            serialized_items = ItemSerializer(items, many=True)
            invoice_list.append({
                'invoice': serialized_invoice.data,
                'items': serialized_items.data
            })

            return Response({"invoices":invoice_list})
        else:
            invoices = Invoice.objects.filter(recipientID=request.user.uuid)
            print("2")
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
            method = request.data.get('method', None)
            try:
                user = AppUser.objects.get(email = email)
                auth = authenticate(request, email=email, password=password)
                if auth is not None and method is None:
                    token, created = Token.objects.get_or_create(user=user)
                    user_data = {"email":user.email, "firstName":user.first_name, "password":user.password, "uuid":user.uuid}
                    return Response({"status": "OK", "token" : token.key, "data":user_data})
                elif auth is not None and method == 'external':
                    return Response({"status": "OK", "uuid" : user.uuid})
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


#In the future, once testing is done, move the 'external' param to just be a GET request function.
class MerchantAuthenticateView(APIView):
    def post(self, request):
        if request.data:
            merchantID = request.data.get('merchantID', None)
            merchantAPIKey = request.data.get('merchantAPIKey', None)
            merchantMasterPassword = request.data.get('masterPassword', None)
            method = request.data.get('method', None)
            print(request.data)
            print(merchantAPIKey)
            print(merchantID)
            try:
                merchant = MerchantAccount.objects.get(merchantID = merchantID)
                print(merchant.user.email)
                auth = authenticate(request, email=merchant.user.email, password=merchantMasterPassword)
                if auth is not None and method != 'external':
                    token, created = Token.objects.get_or_create(user=merchant.user)
                    merchantKey = APIKey.objects.get(owner__user__uuid = merchant.user.uuid)
                    print(merchantKey.key)
                    merchant_data = {'merchant-id':merchant.merchantID, 'merchant-api-key':merchantKey.key}
                    if str(merchantKey.key) != merchantAPIKey.strip():
                        return Response({'status':'error', 'message':'API key is either invalid or expired, please try again or contact customer support.'}, status=status.HTTP_401_UNAUTHORIZED)
                    else:
                        print(token.key)
                        return Response({'status':'OK', 'token':token.key, 'data':merchant_data}, status=status.HTTP_200_OK)
                elif auth is not None and method == 'external':
                    token, created = Token.objects.get_or_create(user=merchant.user)
                    return Response({"status": "OK", "sessiontoken":token.key})
                else:
                    print("here")
                    return Response({"message":"Error occured while signing in, please try again or contact customer support."}, status=status.HTTP_401_UNAUTHORIZED)
            except MerchantAccount.DoesNotExist:
                return Response({"message":"Merchant ID not associated with account, please try again or contact customer support."}, status=status.HTTP_401_UNAUTHORIZED)
            
class MerchantRegisterView(APIView):

    def post(self, request):
        if request.data:
            print(request.data)
            authUserUUID = request.data.get('uuid', None)
            authUserPass = request.data.get('masterPassword', None)
            #sends data to serializer model to be converted into python readable data
            serialized_account = MerchantAccountSerializer(data=request.data)
        if serialized_account.is_valid():
            try:
                account = MerchantAccount.objects.get(user__uuid=authUserUUID)
                account.businessName = serialized_account.data['businessName']
                account.merchantID = serialized_account.data['businessName'].replace(" ", '') + ''.join(random.choices(string.ascii_letters + string.digits, k=16))
                account.user.set_password(authUserPass)
                print(authUserPass)
                account.businessAddress = serialized_account.data['businessAddress']
                account.businessType = serialized_account.data['businessType']
                account.industry = serialized_account.data['industry']
                account.primaryContactName = serialized_account.data['primaryContactName']
                account.primaryPhoneNumber = serialized_account.data['primaryPhoneNumber']
                account.numRegisters = serialized_account.data['numRegisters']
                account.user.save()
                account.save()
                merchantAPIKey = APIKey.objects.create(owner=account)
                confirmationEmail('jcseagle21@gmail.com', account.user.email, 'vcibcvsaaftekzpp', account.merchantID, merchantAPIKey.key)
            except IntegrityError:
                return(Response({"status":"error",'type':'Integrity Error', "message":"Email is already in use."}, status=status.HTTP_401_UNAUTHORIZED))
            return(Response({"status":"OK" ,"message":f"successfully created account {account.user.uuid}, you should receive a confirmation email shortly with your merchant ID number and API key"}, status=status.HTTP_200_OK))
        else:
            print(serialized_account.errors)
            return(Response({"error":"bad request"}))

class VerifyMerchant(APIView):

    def get(self, request):
        email = request.GET.get('email')
        try:
                query = MerchantAccount.objects.get(user__email=email)
                return Response({'status':'OK', 'message':f'Successfully verified {query.user.email}! please return to previous screen to continue singing up', 'uuid':query.user.uuid}, status=status.HTTP_200_OK)
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
                        #makes a query in db to find Unverified account objects passed in post request
                        account = UnverifiedMerchantAccount.objects.get(token=token)
                        #creates new verified merchant account with token as uuid and deletes old unverified user account
                        UnverifiedMerchantAccount.objects.filter(email = account.email).exclude(pk=account.pk).delete()
                        #creates an underlying user object for the merchant account class to build on that uses the AppUser class for authentication purposes
                        authUser = AppUser.objects.create_user(uuid=token, email=account.email)
                        authUser.save()
                        verified_account = MerchantAccount.objects.create(
                            user=authUser
                        )
                    except ValidationError:
                        return Response({'status':'ERROR', 'message':'The link you followed may be expired or broken, please try again.'})
                    return Response({'status':'OK', 'message':f'the email address {verified_account.user.email} has been verified.'})
                except UnverifiedMerchantAccount.DoesNotExist:
                    return Response({'status':'ERROR', 'message':'Error verifying account, please try again later.'})
        else:
            return Response({'status':'ERROR', 'message':'No token received from client, please reload and try again.'})

#Fetches receipts issued by merchant account.      
class GetMerchantViewInvoice(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(f'AUTH TOKEN: {request.auth}')
        query = request.query_params.get('query', None)
        type = request.query_params.get('type')
        given_key = request.GET.get('api_key')
        merchant_account = request.user.merchant_profile
        self.isValid = False
        try: 
            #key searching functions below are temp, will switch to aws system for prod
            #searches and returns list of APIKey objs assoc with account and checks if any exist.
            api_key = APIKey.objects.filter(owner__user__uuid=merchant_account.user.uuid)
            if api_key.count() > 0:
                    #iterates through keys to see if any match the key passed by user and if one does, sets isValid to true.
                    for key in api_key:
                        print(key.key)
                        print(f"given key: {given_key}")
                        if str(key.key) == given_key:
                            self.isValid = True
                    if self.isValid:
                        invoice_list = []
                        if type == 'SINGLE':
                            invoices = Invoice.objects.filter(merchantID=merchant_account.merchantID, invoiceID=query)
                            if not invoices:
                                return Response({"message": "No invoices have been issued from this account yet."}, status=status.HTTP_404_NOT_FOUND)
                        else:
                            invoices = Invoice.objects.filter(merchantID=merchant_account.merchantID)
                            if not invoices:
                                return Response({"message": "No invoices have been issued from this account yet."}, status=status.HTTP_404_NOT_FOUND)

                        for invoice in invoices:
                            serialized_invoice = InvoiceSerializer(invoice)
                            items = Item.objects.filter(parent=invoice)
                            serialized_items = ItemSerializer(items, many=True)
                            invoice_list.append({
                                'invoice': serialized_invoice.data,
                                'items': serialized_items.data
                            })

                        return Response({"invoices":invoice_list})
                    else:
                        return Response({'ERROR':'API key is either invalid or expired please contact customer support at support@onereturn.com'}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                raise Exception("No API key associated with account")
        except AttributeError:
            print("here 1")
            return Response({'ERROR':'You are not accessing this endpoint from a registered merchant account'}, status=status.HTTP_401_UNAUTHORIZED)
        
#function to retrieve data such as merchantID and API Key on a merchant account behind a verification wall for as-needed use rather than storing it in the frontend.
class RetrieveMerchantData(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try: 
            #REMOVE: returns as a list, should probably change this later but will keep for demo purposes
            api_keys = APIKey.objects.filter(owner__user__uuid=request.user.merchant_profile.user.uuid)
            merchantID = request.user.merchant_profile.merchantID
            return Response({'status':'OK', 'merchantID':merchantID, 'api_key':api_keys[0].key}, status=status.HTTP_200_OK)
        except AttributeError:
            return Response({'status':'ERROR'}, status=status.HTTP_401_UNAUTHORIZED)