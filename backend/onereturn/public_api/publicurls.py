from django.urls import path
from . import views

urlpatterns = [
    path('CreateInvoice/', views.CreateInvoice.as_view(), name='getinvoice'),
]
