from django.db import models
from django.contrib.auth.models import User


class Dashboard(models.Model):
    """Model representing a user dashboard."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboards', null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Widget(models.Model):
    """Model representing a widget inside a dashboard."""
    
    # Widget type choices
    WIDGET_TYPES = [
        ('chart', 'Chart'),
        ('table', 'Table'),
        ('kpi', 'KPI'),
        ('orders_summary', 'Orders Summary'),
        ('revenue_chart', 'Revenue Chart'),
        # New chart types
        ('bar_chart', 'Bar Chart'),
        ('line_chart', 'Line Chart'),
        ('area_chart', 'Area Chart'),
        ('scatter_chart', 'Scatter Chart'),
        ('pie_chart', 'Pie Chart'),
    ]
    
    dashboard = models.ForeignKey(
        Dashboard,
        on_delete=models.CASCADE,
        related_name='widgets'
    )
    type = models.CharField(max_length=50, choices=WIDGET_TYPES)
    title = models.CharField(max_length=255)
    config = models.JSONField(default=dict, blank=True)
    position_x = models.IntegerField(default=0)
    position_y = models.IntegerField(default=0)
    width = models.IntegerField(default=4)
    height = models.IntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position_y', 'position_x']

    def __str__(self):
        return f"{self.title} ({self.type})"
