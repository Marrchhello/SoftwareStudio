import requests
import json
from typing import Dict, Any
from datetime import datetime

class APITester:
    def __init__(self, base_url: str = "http://localhost:8000/api/v1"):
        self.base_url = base_url
        self.token = None
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def login(self, email: str, password: str) -> bool:
        """Login and get authentication token"""
        url = f"{self.base_url}/auth/login"
        data = {
            "username": email,
            "password": password,
            "grant_type": "password"
        }
        
        try:
            response = requests.post(
                url,
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            print(f"\nLogin attempt for {email}")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                self.token = response.json()["access_token"]
                self.headers["Authorization"] = f"Bearer {self.token}"
                print("Login successful!")
                return True
            else:
                print(f"Login failed: {response.json().get('detail', 'Unknown error')}")
                return False
        except requests.RequestException as e:
            print(f"Request error: {e}")
            return False

    def test_student_endpoints(self):
        """Test student-related endpoints"""
        print("\nTesting Student Endpoints:")
        print("-" * 50)
        
        # Get current student by JWT token
        response = requests.get(
            f"{self.base_url}/students/current",  # Changed from /me to /current
            headers=self.headers
        )
        print("\nGet Current Student Profile:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

    def test_course_endpoints(self):
        """Test course-related endpoints"""
        print("\nTesting Course Endpoints:")
        print("-" * 50)
        
        # Get all courses for current student
        response = requests.get(
            f"{self.base_url}/courses",  # Changed from /enrolled to base endpoint
            headers=self.headers
        )
        print("\nGet Student Courses:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

    def test_assignment_endpoints(self):
        """Test assignment-related endpoints"""
        print("\nTesting Assignment Endpoints:")
        print("-" * 50)
        
        # Get assignments for current student
        response = requests.get(
            f"{self.base_url}/assignments",  # Changed from /my to base endpoint
            headers=self.headers
        )
        print("\nGet Student Assignments:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

    def test_grade_endpoints(self):
        """Test grade-related endpoints"""
        print("\nTesting Grade Endpoints:")
        print("-" * 50)
        
        # Get grades for current student
        response = requests.get(
            f"{self.base_url}/grades/student",  # Changed from /my to /student
            headers=self.headers
        )
        print("\nGet Student Grades:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")