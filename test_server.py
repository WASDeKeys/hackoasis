#!/usr/bin/env python3
"""
Simple test script to check Django server functionality
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
project_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(project_dir))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

try:
    django.setup()
    print("✓ Django setup successful")
    
    # Test basic imports
    from django.contrib.auth.models import User
    from workouts.models import UserProfile
    print("✓ Models imported successfully")
    
    # Test database connection
    from django.db import connection
    cursor = connection.cursor()
    cursor.execute("SELECT 1")
    print("✓ Database connection successful")
    
    print("\n✓ All basic checks passed!")
    print("You can now try to run: python manage.py runserver")
    
except Exception as e:
    print(f"✗ Error: {e}")
    print("\nTroubleshooting steps:")
    print("1. Make sure you're in the project directory")
    print("2. Install required packages: pip install -r requirements.txt")
    print("3. Run migrations: python manage.py migrate")
