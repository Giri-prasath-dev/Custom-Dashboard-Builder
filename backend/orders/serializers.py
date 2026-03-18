from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model with validation and auto total calculation."""
    
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'postal_code',
            'country',
            'product',
            'quantity',
            'unit_price',
            'total_amount',
            'status',
            'created_by',
            'created_by_username',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'total_amount', 'created_by', 'created_at', 'updated_at']
    
    def validate_quantity(self, value):
        """Validate quantity is at least 1."""
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1")
        return value
    
    def validate(self, attrs):
        """Validate and calculate total amount."""
        quantity = attrs.get('quantity')
        unit_price = attrs.get('unit_price')
        
        # Calculate total_amount
        if quantity and unit_price:
            attrs['total_amount'] = quantity * unit_price
        
        return attrs
    
    def create(self, validated_data):
        """Create order with authenticated user."""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
