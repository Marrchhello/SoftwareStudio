import requests
import json
from typing import Dict, Optional

class UserTester:
    def __init__(self, base_url: str = "http://localhost:8000/api/v1"):
        self.base_url = base_url
        self.token = None
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        self.user_id = None

    def create_student(self) -> Optional[Dict]:
        """Create a new student account"""
        url = f"{self.base_url}/students/"
        data = {
            "email": "test.student111@example.com",
            "password": "password123",
            "name": "Test Student",
            "semester": 1,
            "year": 2024,
            "degree_id": 1,
            "age": 20
        }

        try:
            print("\nCreating student account:")
            print("-" * 50)
            response = requests.post(url, json=data, headers=self.headers)
            self._print_response(response)
            return response.json() if response.status_code == 200 else None
        except requests.RequestException as e:
            print(f"Failed to create student: {e}")
            return None

    def login(self) -> bool:
        """Login with created student account"""
        url = f"{self.base_url}/auth/login"
        data = {
            "username": "test.student111@example.com",
            "password": "password123",
            "grant_type": "password"
        }

        try:
            print("\nLogging in:")
            print("-" * 50)
            response = requests.post(
                url,
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            self._print_response(response)
            
            if response.status_code == 200:
                self.token = response.json()["access_token"]
                self.headers["Authorization"] = f"Bearer {self.token}"
                return True
            return False
        except requests.RequestException as e:
            print(f"Login failed: {e}")
            return False

    def view_grades(self) -> Optional[Dict]:
        """View student grades"""
        url = f"{self.base_url}/grades/"
        try:
            print("\nFetching grades:")
            print("-" * 50)
            response = requests.get(url, headers=self.headers)
            self._print_response(response)
            return response.json() if response.status_code == 200 else None
        except requests.RequestException as e:
            print(f"Failed to fetch grades: {e}")
            return None

    def view_assignments(self) -> Optional[Dict]:
        """View student assignments"""
        url = f"{self.base_url}/assignments/"
        try:
            print("\nFetching assignments:")
            print("-" * 50)
            response = requests.get(url, headers=self.headers)
            self._print_response(response)
            return response.json() if response.status_code == 200 else None
        except requests.RequestException as e:
            print(f"Failed to fetch assignments: {e}")
            return None

    def view_courses(self) -> Optional[Dict]:
        """View student courses"""
        url = f"{self.base_url}/courses/"
        try:
            print("\nFetching courses:")
            print("-" * 50)
            response = requests.get(url, headers=self.headers)
            self._print_response(response)
            return response.json() if response.status_code == 200 else None
        except requests.RequestException as e:
            print(f"Failed to fetch courses: {e}")
            return None

    def _print_response(self, response: requests.Response) -> None:
        """Helper method to print formatted response"""
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print("Body:", json.dumps(response.json(), indent=2) if response.text else "No body")

def main():
    tester = UserTester()
    
    # Create student account
    student = tester.create_student()
    if not student:
        print("Failed to create student account")
        return

    # Login with created account
    if not tester.login():
        print("Failed to login")
        return

    # View student data
    tester.view_grades()
    tester.view_assignments()
    tester.view_courses()

if __name__ == "__main__":
    main()