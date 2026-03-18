from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardViewSet


# Create router and register viewsets
router = DefaultRouter()
router.register(r'', DashboardViewSet, basename='dashboard')

# URLs for dashboard APIs: /api/dashboard/
urlpatterns = router.urls
