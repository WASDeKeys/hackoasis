#!/usr/bin/env python3
"""
Mock backend server for testing the frontend
This provides a simple HTTP server that responds to the API endpoints
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
from datetime import datetime
import uuid

class MockAPIHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/auth/register/':
            self.handle_register()
        elif self.path == '/api/auth/login/':
            self.handle_login()
        elif self.path == '/api/auth/verify/':
            self.handle_verify()
        else:
            self.send_error(404)

    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/api/user-profile/':
            self.handle_get_profile()
        elif self.path == '/api/workout-plans/':
            self.handle_get_workout_plans()
        elif self.path == '/api/workout-sessions/':
            self.handle_get_workout_sessions()
        else:
            self.send_error(404)

    def do_PATCH(self):
        """Handle PATCH requests"""
        if self.path == '/api/user-profile/':
            self.handle_update_profile()
        else:
            self.send_error(404)

    def handle_register(self):
        """Handle user registration"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        # Simulate registration
        user_id = str(uuid.uuid4())
        token = f"mock_token_{user_id}"
        
        response_data = {
            'token': token,
            'user': {
                'id': user_id,
                'email': data.get('email'),
                'username': data.get('username'),
                'name': data.get('username')
            }
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_login(self):
        """Handle user login"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        # Simulate login
        user_id = str(uuid.uuid4())
        token = f"mock_token_{user_id}"
        
        response_data = {
            'token': token,
            'user': {
                'id': user_id,
                'email': data.get('email'),
                'username': 'testuser',
                'name': 'Test User'
            }
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_verify(self):
        """Handle token verification"""
        response_data = {
            'id': '1',
            'email': 'test@example.com',
            'username': 'testuser',
            'name': 'Test User'
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_get_profile(self):
        """Handle get user profile"""
        response_data = {
            'id': '1',
            'user': {
                'id': '1',
                'email': 'test@example.com',
                'username': 'testuser',
                'name': 'Test User'
            },
            'name': 'Test User',
            'availability': {},
            'equipment': [],
            'fatigue_log': []
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_update_profile(self):
        """Handle update user profile"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        response_data = {
            'id': '1',
            'user': {
                'id': '1',
                'email': 'test@example.com',
                'username': 'testuser',
                'name': data.get('name', 'Test User')
            },
            'name': data.get('name', 'Test User'),
            'availability': data.get('availability', {}),
            'equipment': data.get('equipment', []),
            'fatigue_log': data.get('fatigue_log', [])
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_get_workout_plans(self):
        """Handle get workout plans"""
        response_data = []
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_get_workout_sessions(self):
        """Handle get workout sessions"""
        response_data = []
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

def run_mock_server():
    """Run the mock server"""
    server_address = ('localhost', 8000)
    httpd = HTTPServer(server_address, MockAPIHandler)
    print(f"Mock backend server running on http://localhost:8000")
    print("This is a temporary solution for testing the frontend")
    print("Press Ctrl+C to stop the server")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_mock_server()
