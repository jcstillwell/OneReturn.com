from django.urls import path
from . import views

urlpatterns = [
    path('createinvoice/', views.CreateInvoice.as_view(), name='createinvoice'),
]
