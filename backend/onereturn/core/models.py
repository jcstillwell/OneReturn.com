from django.db import models
from django.conf import settings
from django.contrib import admin
import uuid
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

# Create your models here.
class AppUserManager(BaseUserManager):
    def create_user(self, uuid, email=None, first_name=None, last_name=None, password=None, emailVerified=False):

        if not email and emailVerified == True:
            raise ValueError('User must have an email address')
        
        user = self.model(
            uuid = uuid,
            email = self.normalize_email(email),
            first_name = first_name,
            last_name = last_name,
        )

        def __str__(self):
            return self.email
        
        user.set_password(password)
        user.save(using=self._db)
        return user

class AppUser(AbstractBaseUser):
    email = models.EmailField(unique=True, default=None, null=True)
    uuid = models.CharField(max_length=100, unique=True, default=None)
    first_name = models.CharField(max_length=100, default=None, null=True)
    last_name = models.CharField(max_length=100, default=None, null=True)
    password = models.CharField(max_length=100, default=None, null=True)
    is_active = models.BooleanField(default=True)
    sharedInvoices = models.ManyToManyField('Invoice')
    emailVerified = models.BooleanField(default=False)
    phoneVerifed = models.BooleanField(default=False)
    regComplete = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'

    objects = AppUserManager()

    def __str__(self):
        return self.email
    
class AppUserAdmin(admin.ModelAdmin):

    list_display = ('email', 'first_name', 'last_name', 'is_active', 'emailVerified', 'phoneVerifed', 'regComplete')
    search_fields = ('email', 'first_name', 'last_name')
    readonly_fields = ('uuid',)

    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()

admin.site.register(AppUser, AppUserAdmin)
    
## Migrate all merchant account functions to have authentication based on AppUsers auth system
class MerchantAccount(models.Model):
    user = models.OneToOneField(AppUser, on_delete=models.CASCADE, related_name='merchant_profile', default=None)
    merchantID = models.CharField(max_length=100, default=None, null=True)
    businessName = models.CharField(max_length=100, default=None, null=True)
    businessAddress = models.CharField(max_length=100, default=None, null=True)
    businessType = models.CharField(max_length=100, default=None, null=True)
    industry = models.CharField(max_length=100, default=None, null=True)
    primaryContactName = models.CharField(max_length=100, default=None, null=True)
    primaryPhoneNumber = models.CharField(max_length=100, default=None, null=True)
    numRegisters = models.CharField(max_length=100, default=None, null=True)
    emailVerified = models.BooleanField(default=False)

    def __str__(self):
        return self.merchantID

class UnverifiedMerchantAccount(models.Model):
    email = models.CharField(max_length=100, default=None)
    token = models.UUIDField(default=uuid.uuid4, unique=True)

class Item(models.Model):
    name = models.CharField(max_length=100, default=None)
    parent = models.ForeignKey('invoice', on_delete=models.CASCADE, default=None)
    returned = models.BooleanField(default=False)
    returnedBy = models.CharField(max_length=100,default=None, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    originalVendor = models.CharField(max_length = 100, default=None)
    itemCategory = models.CharField(max_length = 100, default=None)
    itemSku = models.CharField(max_length = 100, default=None)
    price = models.FloatField(default=0.00)
    paymentMethod = models.CharField(max_length = 100, default=None)
    cardInfo = models.CharField(max_length = 4, default=None, null=True)

class Invoice(models.Model):
    recipientID = models.CharField(max_length = 100, default=None)
    merchantID = models.CharField(max_length = 100, default=None)
    merchantLocNumber = models.CharField(max_length = 100, default=None)
    merchantAddress = models.CharField(max_length = 100, default=None)
    merchantName = models.CharField(max_length=100, default=None)
    invoiceID = models.CharField(max_length=100, default=None)
    dateCreated = models.DateTimeField(default=None)
    flagged = models.BooleanField(default=False)
    total = models.FloatField(default=0.00)
    cards_used = models.CharField(max_length=4, null=True)
    sharedWith = models.ManyToManyField("AppUser", default=None)
    transactionHistory = ArrayField(models.CharField(max_length=100, default=None), default=list)

class UnverifiedUser(models.Model):
    email = models.CharField(max_length=100, default=None)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)


class APIKey(models.Model):
    keyID = models.CharField(max_length=100, default=None, unique=True)
    key = models.CharField(max_length=100 ,default=None, unique=True)
    created = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey('MerchantAccount', default=None, on_delete=models.CASCADE)

class APIKeyAuthentication():
    def authenticate(self, request):
        api_key = request.GET.get('api_key')
        if not api_key:
            return None
        
        try:
            api_key_object = APIKey.object.get(key=api_key)
        except APIKey.DoesNotExist:
            raise AuthenticationFailed('Invalid or Expired API Key')
        
        return (api_key_object, None)