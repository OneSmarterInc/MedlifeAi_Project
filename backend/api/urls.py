from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView,
    family_profile_list_create,
    family_profile_detail,
    ai_chat_view,
    scan_prescription_view,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('family-profiles/', family_profile_list_create, name='family_profiles'),
    path('family-profiles/<int:pk>/', family_profile_detail, name='family_profile_detail'),
    path('ai-chat/', ai_chat_view, name='ai_chat'),
    path('scan-prescription/', scan_prescription_view, name='scan_prescription'),
]