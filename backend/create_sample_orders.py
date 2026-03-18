#!/usr/bin/env python
"""Create sample orders for testing the orders functionality."""
import os
import sys
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard_builder.settings')
import django
django.setup()

from django.contrib.auth.models import User
from orders.models import Order

# Get or create a test user
user, _ = User.objects.get_or_create(username='testuser', defaults={'email': 'test@test.com'})

# Available products from the dropdown
products = [
    'VoIP Corporate Package',
    'Business Internet 500 Mbps',
    'Fiber Internet 1 Gbps',
    '5G Unlimited Mobile Plan',
    'Fiber Internet 300 Mbps',
]

# Updated statuses
statuses = ['Pending', 'In Progress', 'Completed']

# Sample customer data
first_names = ['Michael', 'Ryan', 'Olivia', 'Lucas', 'Emma', 'James', 'Sophia', 'William']
last_names = ['Harris', 'Cooper', 'Carter', 'Martin', 'Brown', 'Smith', 'Johnson', 'Williams']
cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Toronto', 'Vancouver', 'Sydney']
states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'ON', 'BC', 'NSW']
countries = ['United States', 'Canada', 'Australia']

# Create 20 sample orders
for i in range(20):
    product = random.choice(products)
    quantity = random.randint(1, 5)
    unit_price = round(random.uniform(50, 500), 2)
    status = random.choice(statuses)
    
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    
    Order.objects.create(
        first_name=first_name,
        last_name=last_name,
        email=f'{first_name.lower()}.{last_name.lower()}{i}@example.com',
        phone=f'+1-{random.randint(200,999)}-{random.randint(100,999)}-{random.randint(1000,9999)}',
        address=f'{random.randint(100,9999)} {random.choice(["Main", "Oak", "Maple", "Cedar", "Pine"])} {random.choice(["Street", "Avenue", "Road", "Boulevard"])}',
        city=random.choice(cities),
        state=random.choice(states),
        postal_code=str(random.randint(10000, 99999)),
        country=random.choice(countries),
        product=product,
        quantity=quantity,
        unit_price=unit_price,
        status=status,
        created_by=user,
    )

print(f'Successfully created {Order.objects.count()} total orders')
