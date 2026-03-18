"""
Analytics API views - Handle HTTP requests and return JSON responses.
Views delegate business logic to services layer.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .services import (
    get_revenue_data,
    get_orders_data,
    get_kpi_data,
    get_kpi_metric,
    get_chart_data,
    get_orders_table,
)


class KPIAnalyticsView(APIView):
    """
    GET /api/analytics/kpi/
    
    Query parameters:
    - metric: Field to aggregate (total_amount, quantity, unit_price, orders)
    - aggregation: SUM, AVG, COUNT
    - range: Date filter (all, today, 7d, 30d, 90d)
    
    Example: /api/analytics/kpi?metric=total_amount&aggregation=SUM&range=30d
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        metric = request.query_params.get('metric', 'total_amount')
        aggregation = request.query_params.get('aggregation', 'SUM').upper()
        range_param = request.query_params.get('range', 'all')
        
        # Validate aggregation
        if aggregation not in ['SUM', 'AVG', 'COUNT']:
            return Response(
                {'error': 'Invalid aggregation. Use SUM, AVG, or COUNT'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate metric
        allowed_metrics = [
            'total_amount', 'quantity', 'unit_price', 'orders',
            'customer_id', 'customer_name', 'email_id', 'address',
            'order_date', 'product', 'created_by', 'status',
        ]
        
        data = get_kpi_metric(metric, aggregation, range_param)
        return Response(data, status=status.HTTP_200_OK)


class ChartAnalyticsView(APIView):
    """
    GET /api/analytics/chart/
    
    Query parameters:
    - x: Field to group by (product, status, city)
    - y: Field to aggregate (quantity, total_amount, unit_price, orders)
    - aggregation: SUM, AVG, COUNT
    - range: Date filter (all, today, 7d, 30d, 90d)
    
    Example: /api/analytics/chart?x=product&y=quantity&aggregation=SUM&range=30d
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        x = request.query_params.get('x', 'product')
        y = request.query_params.get('y', 'quantity')
        aggregation = request.query_params.get('aggregation', 'SUM').upper()
        range_param = request.query_params.get('range', 'all')
        
        # Validate x field
        allowed_x = [
            'product', 'status', 'city', 'created_by',
            'quantity', 'unit_price', 'total_amount', 'country',
        ]
        
        # Validate aggregation
        if aggregation not in ['SUM', 'AVG', 'COUNT']:
            return Response(
                {'error': 'Invalid aggregation. Use SUM, AVG, or COUNT'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = get_chart_data(x, y, aggregation, range_param)
        return Response(data, status=status.HTTP_200_OK)


class OrdersAnalyticsView(APIView):
    """
    GET /api/analytics/orders/
    
    Query parameters:
    - range: Date filter (all, today, 7d, 30d, 90d)
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20)
    - status: Filter by status
    - search: Search in product/customer name
    
    Example: /api/analytics/orders?range=30d&page=1&page_size=10
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        range_param = request.query_params.get('range', 'all')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        status_filter = request.query_params.get('status', None)
        search = request.query_params.get('search', None)
        sort_field = request.query_params.get('sort_field', None)
        sort_order = request.query_params.get('sort_order', 'asc')
        
        # Validate range
        allowed_ranges = ['all', 'today', '7d', '30d', '90d']
        if range_param not in allowed_ranges:
            return Response(
                {'error': f'Invalid range. Allowed: {", ".join(allowed_ranges)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = get_orders_table(
            range_param=range_param,
            page=page,
            page_size=page_size,
            status=status_filter,
            search=search,
            sort_field=sort_field,
            sort_order=sort_order,
        )
        return Response(data, status=status.HTTP_200_OK)


# Legacy views for backward compatibility
class RevenueAnalyticsView(APIView):
    """
    GET /api/analytics/revenue/
    Returns revenue data for chart rendering.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        range_param = request.query_params.get('range', 'all')
        data = get_revenue_data(range_param)
        return Response(data, status=status.HTTP_200_OK)
