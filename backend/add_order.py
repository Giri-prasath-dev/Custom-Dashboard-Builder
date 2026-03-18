#!/usr/bin/env python
"""Add one more order to make it 10."""
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard_builder.settings')
import django
django.setup()

from django.contrib.auth.models import User
from orders.models import Order

user = User.objects.first()
products = ['VoIP Corporate Package', 'Business Internet 500 Mbps', 'Fiber Internet 1 Gbps', '5G Unlimited Mobile Plan', 'Fiber Internet 300 Mbps']
statuses = ['Pending', 'In Progress', 'Completed']

order = Order(
    first_name='Emma',
    last_name='Wilson',
    email='emma.wilson@example.com',
    phone='+1-555-987-6543',
    address='456 Oak Avenue',
    city='Los Angeles',
    state='CA',
    postal_code='90001',
    country='United States',
    product=products[2],
    quantity=1,
    unit_price=299.99,
    status=statuses[2],
    created_by=user,
)
order.save()
print(f'Created order ID: {order.id}')
print(f'Total orders: {Order.objects.count()}')
