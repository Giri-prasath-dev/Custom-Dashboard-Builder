"""
Analytics services - Business logic layer for data retrieval from Order model.
Keeps views clean by separating business logic from API handling.
"""
from datetime import datetime, timedelta
from django.db.models import Sum, Avg, Count, Q, Value
from django.db.models.functions import Concat, TruncDate
from django.utils import timezone
from decimal import Decimal

from orders.models import Order

# Fields that support numeric aggregation (SUM, AVG)
NUMERIC_FIELDS = {'total_amount', 'quantity', 'unit_price'}


def get_date_range_filter(range_param):
    """
    Convert range parameter to Django date filter.
    
    Supported values:
    - all: No date filter
    - today: Today's orders
    - 7d: Last 7 days
    - 30d: Last 30 days
    - 90d: Last 90 days
    
    Returns a Q object for filtering.
    """
    today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    if range_param == 'today':
        return Q(created_at__gte=today)
    elif range_param == '7d':
        return Q(created_at__gte=today - timedelta(days=7))
    elif range_param == '30d':
        return Q(created_at__gte=today - timedelta(days=30))
    elif range_param == '90d':
        return Q(created_at__gte=today - timedelta(days=90))
    elif range_param == 'all' or range_param is None:
        return Q()  # No filter
    else:
        return Q()  # Default to no filter


def get_kpi_metric(metric, aggregation, range_param='all'):
    """
    Calculate KPI metric from Order model.
    
    Parameters:
    - metric: The field to aggregate (total_amount, quantity, etc.)
    - aggregation: SUM, AVG, COUNT
    - range: Date filter (all, today, 7d, 30d, 90d)
    
    Returns:
    - Dictionary with 'value' key containing the calculated metric
    """
    # Apply date filter
    date_filter = get_date_range_filter(range_param)
    queryset = Order.objects.filter(date_filter)
    
    # Map all spec metrics to DB fields
    allowed_metrics = {
        'total_amount': 'total_amount',
        'quantity': 'quantity',
        'unit_price': 'unit_price',
        'orders': 'id',
        'customer_id': 'id',
        'customer_name': 'first_name',
        'email_id': 'email',
        'address': 'address',
        'order_date': 'created_at',
        'product': 'product',
        'created_by': 'created_by_id',
        'status': 'status',
    }
    
    metric_field = allowed_metrics.get(metric, 'total_amount')
    
    # Non-numeric fields can only use COUNT
    if metric not in NUMERIC_FIELDS and aggregation not in ('COUNT', 'DISTINCT_COUNT'):
        aggregation = 'COUNT'
    
    # Perform aggregation
    if aggregation == 'SUM':
        result = queryset.aggregate(value=Sum(metric_field))
    elif aggregation == 'AVG':
        result = queryset.aggregate(value=Avg(metric_field))
    elif aggregation == 'COUNT':
        result = queryset.aggregate(value=Count(metric_field))
    elif aggregation == 'DISTINCT_COUNT':
        result = queryset.aggregate(value=Count(metric_field, distinct=True))
    else:
        result = {'value': 0}
    
    # Handle None values
    value = result.get('value')
    if value is None:
        value = 0
    
    # Convert Decimal to float for JSON serialization
    if isinstance(value, Decimal):
        value = float(value)
    
    return {'value': value}


def get_chart_data(x, y, aggregation, range_param='all'):
    """
    Get chart data with grouping from Order model.
    
    Parameters:
    - x: Field to group by (product, status, created_at__date, etc.)
    - y: Field to aggregate
    - aggregation: SUM, AVG, COUNT
    - range: Date filter
    
    Returns:
    - List of dictionaries with 'name' and 'value' keys
    """
    # Apply date filter
    date_filter = get_date_range_filter(range_param)
    queryset = Order.objects.filter(date_filter)
    
    # Map x-axis fields (all spec fields)
    x_field_map = {
        'product': 'product',
        'status': 'status',
        'city': 'city',
        'created_by': 'created_by__username',
        'quantity': 'quantity',
        'unit_price': 'unit_price',
        'total_amount': 'total_amount',
        'country': 'country',
    }
    
    # Map y-axis fields (all spec fields)
    y_field_map = {
        'quantity': 'quantity',
        'total_amount': 'total_amount',
        'unit_price': 'unit_price',
        'orders': 'id',
        'product': 'product',
        'status': 'status',
        'created_by': 'created_by__username',
    }
    
    x_field = x_field_map.get(x, 'product')
    y_field = y_field_map.get(y, 'quantity')
    
    # Non-numeric y fields can only use COUNT
    if y not in NUMERIC_FIELDS and aggregation != 'COUNT':
        aggregation = 'COUNT'
    
    # Perform grouped aggregation
    if aggregation == 'SUM':
        result = queryset.values(x_field).annotate(value=Sum(y_field)).order_by('-value')
    elif aggregation == 'AVG':
        result = queryset.values(x_field).annotate(value=Avg(y_field)).order_by('-value')
    elif aggregation == 'COUNT':
        result = queryset.values(x_field).annotate(value=Count(y_field)).order_by('-value')
    else:
        result = queryset.values(x_field).annotate(value=Sum(y_field)).order_by('-value')
    
    # Format response
    chart_data = []
    for item in result:
        name = item[x_field] if item[x_field] else 'Unknown'
        value = item['value']
        
        # Convert Decimal to float
        if isinstance(value, Decimal):
            value = float(value)
            
        chart_data.append({
            'name': name,
            'value': value
        })
    
    return chart_data


def get_orders_table(range_param='all', page=1, page_size=20, status=None, search=None, sort_field=None, sort_order='asc'):
    """
    Get orders for table display with filtering and pagination.
    
    Parameters:
    - range: Date filter
    - page: Page number (1-indexed)
    - page_size: Number of items per page
    - status: Filter by status
    - search: Search in product name
    
    Returns:
    - Dictionary with 'results', 'count', 'page', 'page_size'
    """
    # Apply date filter
    date_filter = get_date_range_filter(range_param)
    queryset = Order.objects.filter(date_filter).select_related('created_by')
    
    # Apply status filter
    if status and status != 'all':
        queryset = queryset.filter(status=status)
    
    # Apply search filter
    if search:
        queryset = queryset.filter(
            Q(product__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search)
        )
    
    # Get total count
    total_count = queryset.count()
    
    # Apply sort
    if sort_field:
        order_prefix = '-' if sort_order == 'desc' else ''
        field_map = {
            'order_date': 'created_at',
            'customer_name': 'first_name',
        }
        db_field = field_map.get(sort_field, sort_field)
        queryset = queryset.order_by(f'{order_prefix}{db_field}')
    
    # Apply pagination
    start = (page - 1) * page_size
    end = start + page_size
    orders = queryset[start:end]
    
    # Format results — return ALL order fields for table widget
    results = []
    for order in orders:
        results.append({
            'id': order.id,
            'customer_id': order.id,
            'customer_name': f"{order.first_name} {order.last_name}",
            'first_name': order.first_name,
            'last_name': order.last_name,
            'email': order.email,
            'email_id': order.email,
            'phone': order.phone or '',
            'phone_number': order.phone or '',
            'address': f"{order.address or ''}, {order.city or ''}, {order.state or ''} {order.postal_code or ''}, {order.country or ''}".strip(', '),
            'city': order.city,
            'state': order.state,
            'postal_code': order.postal_code,
            'country': order.country,
            'product': order.product,
            'quantity': order.quantity,
            'unit_price': float(order.unit_price) if order.unit_price else 0,
            'total_amount': float(order.total_amount) if order.total_amount else 0,
            'status': order.status,
            'created_by': order.created_by.username if order.created_by else '',
            'order_date': order.created_at.strftime('%Y-%m-%d') if order.created_at else None,
            'order_id': f"ORD-{order.id:04d}",
            'created_at': order.created_at.isoformat() if order.created_at else None,
        })
    
    return {
        'results': results,
        'count': total_count,
        'page': page,
        'page_size': page_size,
    }


# Legacy functions for backward compatibility
def get_revenue_data(range_param='all'):
    """
    Get revenue data for chart display.
    Returns labels and values for revenue over time.
    """
    date_filter = get_date_range_filter(range_param)
    
    # Group by date using TruncDate (replaces deprecated .extra())
    queryset = Order.objects.filter(date_filter).annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        revenue=Sum('total_amount')
    ).order_by('date')
    
    labels = []
    values = []
    
    for item in queryset:
        date_obj = item['date']
        if date_obj:
            labels.append(date_obj.strftime('%m/%d'))
            revenue = item['revenue']
            values.append(float(revenue) if revenue else 0)
    
    return {
        'labels': labels,
        'values': values
    }


def get_orders_data(range_param='all'):
    """
    Get orders data for table display.
    Returns list of orders with id, customer, amount, status.
    """
    table_data = get_orders_table(range_param=range_param, page=1, page_size=20)
    
    # Convert to legacy format
    orders = []
    for order in table_data['results']:
        orders.append({
            'id': order['id'],
            'customer': f"{order['first_name']} {order['last_name']}",
            'amount': order['total_amount'],
            'status': order['status'],
            'date': order['created_at'][:10] if order['created_at'] else None
        })
    
    return orders


def get_kpi_data(range_param='all'):
    """
    Get KPI metrics for dashboard cards.
    Returns total_orders, revenue, conversion_rate.
    """
    date_filter = get_date_range_filter(range_param)
    queryset = Order.objects.filter(date_filter)
    
    # Calculate metrics
    total_orders = queryset.count()
    
    revenue_result = queryset.aggregate(total=Sum('total_amount'))
    revenue = float(revenue_result['total'] or 0)
    
    avg_order_value = revenue / total_orders if total_orders > 0 else 0
    
    # Calculate conversion rate (completed orders / total orders)
    delivered_count = queryset.filter(status='Completed').count()
    conversion_rate = (delivered_count / total_orders * 100) if total_orders > 0 else 0
    
    return {
        'total_orders': total_orders,
        'revenue': revenue,
        'conversion_rate': round(conversion_rate, 1),
        'avg_order_value': round(avg_order_value, 2),
        'customer_satisfaction': 4.5  # Placeholder - would need additional field
    }
