from django.urls import path
from .views import (
    RegisterView, 
    family_profile_list_create, 
    family_profile_detail, 
    ai_chat_view, 
    scan_prescription_view,
    forgot_password_view,
    reset_password_confirm_view
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('family-profiles/', family_profile_list_create, name='family-profile-list-create'),
    path('family-profiles/<int:pk>/', family_profile_detail, name='family-profile-detail'),
    path('ai-chat/', ai_chat_view, name='ai-chat'),
    path('scan-prescription/', scan_prescription_view, name='scan-prescription'),
    path('forgot-password/', forgot_password_view, name='forgot-password'),
    path('reset-password-confirm/', reset_password_confirm_view, name='reset-password-confirm'),
]