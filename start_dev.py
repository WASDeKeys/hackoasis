#!/usr/bin/env python3
"""
Development startup script for Adaptive Workout Scheduler
This script helps set up and run both backend and frontend in development mode.
"""

import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def run_command(command, cwd=None, shell=True):
    """Run a command and return the process"""
    try:
        process = subprocess.Popen(
            command,
            cwd=cwd,
            shell=shell,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return process
    except Exception as e:
        print(f"Error running command '{command}': {e}")
        return None

def check_dependencies():
    """Check if required dependencies are installed"""
    print("Checking dependencies...")
    
    # Check Python
    try:
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
        print(f"✓ Python: {result.stdout.strip()}")
    except:
        print("✗ Python not found")
        return False
    
    # Check Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        print(f"✓ Node.js: {result.stdout.strip()}")
    except:
        print("✗ Node.js not found. Please install Node.js from https://nodejs.org/")
        return False
    
    # Check npm
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        print(f"✓ npm: {result.stdout.strip()}")
    except:
        print("✗ npm not found")
        return False
    
    return True

def setup_backend():
    """Set up the Django backend"""
    print("\nSetting up backend...")
    
    # Install Python dependencies
    print("Installing Python dependencies...")
    result = subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    if result.returncode != 0:
        print("✗ Failed to install Python dependencies")
        return False
    
    # Run migrations
    print("Running database migrations...")
    result = subprocess.run([sys.executable, "manage.py", "makemigrations"])
    if result.returncode != 0:
        print("✗ Failed to create migrations")
        return False
    
    result = subprocess.run([sys.executable, "manage.py", "migrate"])
    if result.returncode != 0:
        print("✗ Failed to run migrations")
        return False
    
    print("✓ Backend setup complete")
    return True

def setup_frontend():
    """Set up the React frontend"""
    print("\nSetting up frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("✗ Frontend directory not found")
        return False
    
    # Install Node.js dependencies
    print("Installing Node.js dependencies...")
    result = subprocess.run(["npm", "install"], cwd=frontend_dir)
    if result.returncode != 0:
        print("✗ Failed to install Node.js dependencies")
        return False
    
    print("✓ Frontend setup complete")
    return True

def start_servers():
    """Start both backend and frontend servers"""
    print("\nStarting development servers...")
    
    # Start Django backend
    print("Starting Django backend on http://localhost:8000")
    backend_process = run_command([sys.executable, "manage.py", "runserver"])
    
    if not backend_process:
        print("✗ Failed to start backend server")
        return False
    
    # Wait a moment for backend to start
    time.sleep(3)
    
    # Start React frontend
    print("Starting React frontend on http://localhost:3000")
    frontend_process = run_command(["npm", "start"], cwd="frontend")
    
    if not frontend_process:
        print("✗ Failed to start frontend server")
        backend_process.terminate()
        return False
    
    print("\n✓ Both servers are running!")
    print("Backend: http://localhost:8000")
    print("Frontend: http://localhost:3000")
    print("\nPress Ctrl+C to stop both servers")
    
    try:
        # Wait for both processes
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✓ Servers stopped")
    
    return True

def main():
    """Main function"""
    print("Adaptive Workout Scheduler - Development Setup")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        print("\n✗ Missing required dependencies. Please install them and try again.")
        return 1
    
    # Setup backend
    if not setup_backend():
        print("\n✗ Backend setup failed")
        return 1
    
    # Setup frontend
    if not setup_frontend():
        print("\n✗ Frontend setup failed")
        return 1
    
    # Start servers
    if not start_servers():
        print("\n✗ Failed to start servers")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
