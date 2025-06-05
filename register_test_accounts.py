import requests
import json
from urllib.parse import urlencode

# Base URL for the API
BASE_URL = "http://localhost:8000"

def print_response(description, response):
    """Print API response in a formatted way"""
    print(f"\n📝 {description}")
    print("=" * 50)
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
    print("=" * 50)

def register_test_accounts():
    # Test student data
    student_data = {
        "role": "student",
        "user_id": 999,
        "email": "test.student@university.com",
        "username": "test.student",
        "password": "test123",
        "semester": 1,
        "degreeId": 1
    }

    # Test teacher data
    teacher_data = {
        "role": "teacher",
        "user_id": 888,
        "email": "test.teacher@university.com",
        "username": "test.teacher",
        "password": "test123",
        "name": "Test Teacher",
        "title": "Professor"
    }

    print("\n🚀 Setting up test accounts...")

    try:
        # First, try to register without checking for existing accounts
        print("\n👨‍🎓 Registering student account...")
        # Create URL with query parameters
        student_url = f"{BASE_URL}/register?{urlencode(student_data)}"
        student_response = requests.post(
            student_url,
            headers={
                "accept": "application/json"
            }
        )
        print_response("Student Registration Response", student_response)

        print("\n👨‍🏫 Registering teacher account...")
        # Create URL with query parameters
        teacher_url = f"{BASE_URL}/register?{urlencode(teacher_data)}"
        teacher_response = requests.post(
            teacher_url,
            headers={
                "accept": "application/json"
            }
        )
        print_response("Teacher Registration Response", teacher_response)

        # Try logging in with student account
        print("\n🔑 Testing student login...")
        login_response = requests.post(
            f"{BASE_URL}/token",
            data={
                "username": student_data["username"],
                "password": student_data["password"]
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "accept": "application/json"
            }
        )
        print_response("Student Login Response", login_response)

        if login_response.status_code == 200:
            print("\n✅ Test accounts setup successful!")
            token = login_response.json()["access_token"]
            
            # Test token with /me endpoint
            print("\n🔍 Testing token with /me endpoint...")
            me_response = requests.get(
                f"{BASE_URL}/me",
                headers={
                    "Authorization": f"Bearer {token}",
                    "accept": "application/json"
                }
            )
            print_response("Me Endpoint Response", me_response)
        else:
            print("\n❌ Failed to setup test accounts properly")

    except requests.exceptions.ConnectionError:
        print(f"\n❌ Connection Error: Make sure the server is running at {BASE_URL}")
        print("Run the server with: uvicorn app:app --reload")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    register_test_accounts() 