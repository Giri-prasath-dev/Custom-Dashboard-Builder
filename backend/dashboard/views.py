from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from .models import Dashboard, Widget
from .serializers import DashboardSerializer, WidgetSerializer, DashboardLayoutSerializer


class DashboardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Dashboard CRUD operations.
    
    Endpoints:
    - GET /api/dashboard/ - List all dashboards (user-specific, auto-creates single dashboard)
    - POST /api/dashboard/ - Create a new dashboard (disabled for single dashboard)
    - GET /api/dashboard/{id}/ - Retrieve a dashboard
    - DELETE /api/dashboard/{id}/ - Delete a dashboard
    - POST /api/dashboard/save/ - Save dashboard layout
    - GET /api/dashboard/{id}/layout/ - Get dashboard layout
    """
    permission_classes = [IsAuthenticated]
    serializer_class = DashboardSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter dashboards by authenticated user."""
        return Dashboard.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        """Override list to auto-create a single dashboard for the user if none exists."""
        # Check if user already has a dashboard
        existing_dashboards = Dashboard.objects.filter(user=request.user)
        
        if not existing_dashboards.exists():
            # Create a default dashboard for the user
            dashboard = Dashboard.objects.create(
                name='My Dashboard',
                description='Default dashboard',
                user=request.user
            )
            # Return the created dashboard
            serializer = self.get_serializer(dashboard)
            return Response([serializer.data], status=status.HTTP_200_OK)
        
        # Return existing dashboards (should be only one)
        serializer = self.get_serializer(existing_dashboards, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Disable creating multiple dashboards - redirect to update if dashboard exists."""
        existing_dashboard = Dashboard.objects.filter(user=request.user).first()
        if existing_dashboard:
            # If dashboard exists, update it instead
            partial = kwargs.pop('partial', False)
            instance = existing_dashboard
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create a dashboard with the authenticated user."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def save(self, request):
        """
        Save dashboard layout.
        
        Request payload:
        {
            "dashboard_id": 1,
            "widgets": [
                {
                    "id": 1,
                    "type": "bar_chart",
                    "x": 0,
                    "y": 0,
                    "w": 5,
                    "h": 5,
                    "config": {},
                    "title": "My Chart"
                }
            ]
        }
        """
        serializer = DashboardLayoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dashboard_id = serializer.validated_data['dashboard_id']
        widgets_data = serializer.validated_data['widgets']
        
        # Verify dashboard belongs to user
        try:
            dashboard = Dashboard.objects.get(id=dashboard_id, user=request.user)
        except Dashboard.DoesNotExist:
            return Response(
                {'error': 'Dashboard not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Delete existing widgets and create new ones
        with transaction.atomic():
            # Delete all existing widgets for this dashboard
            Widget.objects.filter(dashboard=dashboard).delete()
            
            # Create new widget records
            for widget_data in widgets_data:
                Widget.objects.create(
                    dashboard=dashboard,
                    type=widget_data.get('type', 'bar_chart'),
                    title=widget_data.get('title', 'Widget'),
                    config=widget_data.get('config', {}),
                    position_x=widget_data.get('x', 0),
                    position_y=widget_data.get('y', 0),
                    width=widget_data.get('w', 4),
                    height=widget_data.get('h', 3),
                )
        
        return Response(
            {'message': 'Dashboard layout saved successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def layout(self, request, pk=None):
        """
        Get dashboard layout.
        
        Response:
        {
            "widgets": [
                {
                    "id": 1,
                    "type": "bar_chart",
                    "x": 0,
                    "y": 0,
                    "w": 5,
                    "h": 5,
                    "config": {},
                    "title": "My Chart"
                }
            ]
        }
        """
        try:
            dashboard = Dashboard.objects.get(id=pk, user=request.user)
        except Dashboard.DoesNotExist:
            return Response(
                {'error': 'Dashboard not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        widgets = Widget.objects.filter(dashboard=dashboard)
        
        layout_data = []
        for widget in widgets:
            layout_data.append({
                'id': widget.id,
                'type': widget.type,
                'x': widget.position_x,
                'y': widget.position_y,
                'w': widget.width,
                'h': widget.height,
                'config': widget.config,
                'title': widget.title,
            })
        
        return Response({'widgets': layout_data}, status=status.HTTP_200_OK)


class WidgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Widget CRUD operations.
    
    Endpoints:
    - GET /api/widgets/ - List all widgets (filter by dashboard using ?dashboard=1)
    - POST /api/widgets/ - Create a new widget
    - GET /api/widgets/{id}/ - Retrieve a widget
    - PATCH /api/widgets/{id}/ - Update a widget
    - DELETE /api/widgets/{id}/ - Delete a widget
    """
    permission_classes = [IsAuthenticated]
    queryset = Widget.objects.all()
    serializer_class = WidgetSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['dashboard', 'type']
    search_fields = ['title']
    ordering_fields = ['position_x', 'position_y', 'created_at']
    ordering = ['position_y', 'position_x']

    def get_queryset(self):
        """Filter widgets by dashboard owned by authenticated user."""
        queryset = Widget.objects.filter(dashboard__user=self.request.user)
        dashboard_id = self.request.query_params.get('dashboard')
        if dashboard_id:
            queryset = queryset.filter(dashboard_id=dashboard_id)
        return queryset

    def perform_create(self, serializer):
        """Create a widget with the authenticated user."""
        serializer.save()

    @action(detail=True, methods=['post'])
    def update_position(self, request, pk=None):
        """Update widget position."""
        widget = self.get_object()
        widget.position_x = request.data.get('position_x', widget.position_x)
        widget.position_y = request.data.get('position_y', widget.position_y)
        widget.width = request.data.get('width', widget.width)
        widget.height = request.data.get('height', widget.height)
        widget.save()
        serializer = self.get_serializer(widget)
        return Response(serializer.data)
