from django.urls import path
from . import views

urlpatterns = [
    path('get/', views.GetInvoice.as_view(), name='getinvoice'),
    path('shared/', views.GetShared.as_view(), name='getshared'),
    path('edit/', views.EditInvoice.as_view(), name='edit'),
    path('sendEmail/', views.SendEmail.as_view(), name='sendemail'),
    path('verify/', views.Verify.as_view(), name='verify'),
    path('search/', views.SearchReceipt.as_view(), name='search'),
    path('authenticate/', views.AuthenticateView.as_view(), name='authenticate'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('changeSettings/', views.ChangeSettings.as_view(), name='changesettings'),
]
