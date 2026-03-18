from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Dashboard, Widget


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class DashboardSerializer(serializers.ModelSerializer):
    """Serializer for Dashboard model."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Dashboard
        fields = ['id', 'user', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class WidgetSerializer(serializers.ModelSerializer):
    """Serializer for Widget model."""
    dashboard_name = serializers.CharField(source='dashboard.name', read_only=True)
    
    class Meta:
        model = Widget
        fields = [
            'id', 'dashboard', 'dashboard_name', 'type', 'title', 
            'config', 'position_x', 'position_y', 'width', 'height',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WidgetLayoutSerializer(serializers.Serializer):
    """Serializer for widget layout data (used for saving/loading layout)."""
    id = serializers.IntegerField(required=False)
    type = serializers.CharField(max_length=50)
    x = serializers.IntegerField()
    y = serializers.IntegerField()
    w = serializers.IntegerField()
    h = serializers.IntegerField()
    config = serializers.JSONField(required=False, default=dict)
    title = serializers.CharField(max_length=255, required=False, default='')


class DashboardLayoutSerializer(serializers.Serializer):
    """Serializer for dashboard layout save request."""
    dashboard_id = serializers.IntegerField()
    widgets = WidgetLayoutSerializer(many=True)
