from django.contrib import admin

# Register your models here.
from .models import AppUser

@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'emailVerified', 'phoneVerifed', 'regComplete')
    search_fields = ('email', 'first_name', 'last_name')
    readonly_fields = ('uuid',)