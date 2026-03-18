from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Order CRUD operations.
    
    Endpoints:
    - GET /api/orders/ - List all orders
    - POST /api/orders/ - Create a new order
    - GET /api/orders/{id}/ - Retrieve an order
    - PUT /api/orders/{id}/ - Update an order
    - PATCH /api/orders/{id}/ - Partial update an order
    - DELETE /api/orders/{id}/ - Delete an order
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'city', 'country']
    search_fields = ['first_name', 'last_name', 'email', 'product']
    ordering_fields = ['created_at', 'updated_at', 'total_amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return all orders (not filtered by user)."""
        return Order.objects.all()
    
    def perform_create(self, serializer):
        """Create order with authenticated user."""
        serializer.save(created_by=self.request.user)
