from rest_framework import serializers
from core.models import Invoice, Item, AppUser

class ItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = Item
        fields = '__all__'

    def create(self, validated_data):
        return Item.objects.create(validated_data)
    
class UserSerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(required = True)
    first_name = serializers.CharField(required = True)
    last_name = serializers.CharField(required = True)
    password = serializers.CharField(required = True)

    class Meta:
        model = AppUser
        fields = ['first_name', 'last_name', 'password', 'uuid']

class InvoiceSerializer(serializers.ModelSerializer):

    sharedWith = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'

    def create(self, validated_data):
        return Invoice.objects.create(validated_data)
    
class LoginSerializer(serializers.ModelSerializer):

    class Meta:
        model = AppUser
        fields = ['email', 'password']