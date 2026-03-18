from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WidgetViewSet


# Create router and register viewsets
router = DefaultRouter()
router.register(r'widgets', WidgetViewSet, basename='widget')

# URLs for widget APIs: /api/widgets/
urlpatterns = router.urls
