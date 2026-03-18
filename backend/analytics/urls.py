"""
Analytics app URL configuration.
Maps URL patterns to API views.
"""
from django.urls import path
from .views import (
    RevenueAnalyticsView,
    OrdersAnalyticsView,
    KPIAnalyticsView,
    ChartAnalyticsView,
)

urlpatterns = [
    path('revenue/', RevenueAnalyticsView.as_view(), name='analytics-revenue'),
    path('orders/', OrdersAnalyticsView.as_view(), name='analytics-orders'),
    path('kpi/', KPIAnalyticsView.as_view(), name='analytics-kpi'),
    path('chart/', ChartAnalyticsView.as_view(), name='analytics-chart'),
]
