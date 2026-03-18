#!/usr/bin/env python
"""Create fresh sample orders for the demo user."""
import os
import sys
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard_builder.settings')
import django
django.setup()

from django.contrib.auth.models import User
from orders.models import Order

# Get the demo user
user = User.objects.get(username='demo')

# Available products
products = [
    'VoIP Corporate Package',
    'Business Internet 500 Mbps',
    'Fiber Internet 1 Gbps',
    '5G Unlimited Mobile Plan',
    'Fiber Internet 300 Mbps',
]

# Statuses
statuses = ['Pending', 'In Progress', 'Completed']

# Sample customer data
customers = [
    {'first_name': 'John', 'last_name': 'Doe', 'email': 'john.doe@example.com', 'phone': '+1-555-101-1111', 'address': '123 Main St', 'city': 'New York', 'state': 'NY', 'postal': '10001', 'country': 'United States'},
    {'first_name': 'Jane', 'last_name': 'Smith', 'email': 'jane.smith@example.com', 'phone': '+1-555-202-2222', 'address': '456 Oak Ave', 'city': 'Los Angeles', 'state': 'CA', 'postal': '90001', 'country': 'United States'},
    {'first_name': 'Bob', 'last_name': 'Johnson', 'email': 'bob.johnson@example.com', 'phone': '+1-555-303-3333', 'address': '789 Pine Rd', 'city': 'Chicago', 'state': 'IL', 'postal': '60601', 'country': 'United States'},
    {'first_name': 'Alice', 'last_name': 'Williams', 'email': 'alice.williams@example.com', 'phone': '+1-555-404-4444', 'address': '321 Elm St', 'city': 'Houston', 'state': 'TX', 'postal': '77001', 'country': 'United States'},
    {'first_name': 'Charlie', 'last_name': 'Brown', 'email': 'charlie.brown@example.com', 'phone': '+1-555-505-5555', 'address': '654 Maple Dr', 'city': 'Phoenix', 'state': 'AZ', 'postal': '85001', 'country': 'United States'},
    {'first_name': 'Diana', 'last_name': 'Davis', 'email': 'diana.davis@example.com', 'phone': '+1-555-606-6666', 'address': '987 Cedar Ln', 'city': 'Toronto', 'state': 'ON', 'postal': 'M5V', 'country': 'Canada'},
    {'first_name': 'Edward', 'last_name': 'Miller', 'email': 'edward.miller@example.com', 'phone': '+1-555-707-7777', 'address': '147 Birch Way', 'city': 'Vancouver', 'state': 'BC', 'postal': 'V6B', 'country': 'Canada'},
    {'first_name': 'Fiona', 'last_name': 'Wilson', 'email': 'fiona.wilson@example.com', 'phone': '+1-555-808-8888', 'address': '258 Spruce Ct', 'city': 'Sydney', 'state': 'NSW', 'postal': '2000', 'country': 'Australia'},
    {'first_name': 'George', 'last_name': 'Moore', 'email': 'george.moore@example.com', 'phone': '+1-555-909-9999', 'address': '369 Ash Blvd', 'city': 'Singapore', 'state': 'SG', 'postal': '018956', 'country': 'Singapore'},
    {'first_name': 'Hannah', 'last_name': 'Taylor', 'email': 'hannah.taylor@example.com', 'phone': '+1-555-010-0000', 'address': '741 Willow St', 'city': 'Hong Kong', 'state': 'HK', 'postal': '999077', 'country': 'Hong Kong'},
]

# Create 10 orders
for i in range(10):
    customer = customers[i]
    product = products[i % len(products)]
    quantity = random.randint(1, 5)
    unit_price = round(random.uniform(50, 500), 2)
    status = statuses[i % len(statuses)]
    
    Order.objects.create(
        first_name=customer['first_name'],
        last_name=customer['last_name'],
        email=customer['email'],
        phone=customer['phone'],
        address=customer['address'],
        city=customer['city'],
        state=customer['state'],
        postal_code=customer['postal'],
        country=customer['country'],
        product=product,
        quantity=quantity,
        unit_price=unit_price,
        status=status,
        created_by=user,
    )

print(f'Successfully created {Order.objects.count()} orders for demo user')
