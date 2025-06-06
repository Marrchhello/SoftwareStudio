import requests
import json
import argparse
from getpass import getpass

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

def login_and_get_data(username, password):
    # Get authentication token
    print("\n🔐 Logging in...")
    print(f"Attempting login with username: {username}")
    
    token_response = requests.post(
        f"{BASE_URL}/token",
        data={
            "username": username,
            "password": password
        },
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "accept": "application/json"
        }
    )
    
    if token_response.status_code != 200:
        print("\n❌ Login failed!")
        print_response("Error", token_response)
        return
    
    # Extract token
    token = token_response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}",
        "accept": "application/json"
    }
    print("✅ Login successful!")
    print(f"Token: {token[:20]}...")  # Print first 20 chars of token for debugging

    # Get user info
    print("\n🔍 Getting user info...")
    user_response = requests.get(f"{BASE_URL}/me", headers=headers)
    print(f"Headers sent: {json.dumps(dict(user_response.request.headers), indent=2)}")
    
    if user_response.status_code == 200:
        user_data = user_response.json()
        user_id = user_data.get("user_id")
        role = user_data.get("role")
        print(f"\n👤 Logged in as: {username}")
        print(f"Role: {role}")
        print(f"User ID: {user_id}")

        if role == "student":
            # Get courses
            print("\n📚 Fetching courses...")
            courses_response = requests.get(
                f"{BASE_URL}/student/{user_id}/courses",
                headers=headers
            )
            print_response("Your Courses", courses_response)

            # Get grades
            print("\n📊 Fetching grades...")
            grades_response = requests.get(
                f"{BASE_URL}/student/{user_id}/grades",
                headers=headers
            )
            print_response("Your Grades", grades_response)

            # Get schedule
            print("\n📅 Fetching today's schedule...")
            schedule_response = requests.get(
                f"{BASE_URL}/student/{user_id}/schedule/day/",
                headers=headers
            )
            print_response("Today's Schedule", schedule_response)

            print("\n📅 Fetching week schedule...")
            week_schedule_response = requests.get(
                f"{BASE_URL}/student/{user_id}/schedule/week/",
                headers=headers
            )
            print_response("Week Schedule", week_schedule_response)
        else:
            print("This script is designed for student accounts only.")
    else:
        print("\n❌ Failed to get user info!")
        print_response("Error", user_response)
        print("\nDebug Information:")
        print(f"Token used: {token[:20]}...")
        print(f"Headers sent: {json.dumps(dict(user_response.request.headers), indent=2)}")

def main():
    parser = argparse.ArgumentParser(description='Login to student account and view data')
    parser.add_argument('--username', '-u', help='Username (default: test.student)')
    args = parser.parse_args()

    # Use default test student if no username provided
    username = args.username or "test.student"
    
    try:
        print(f"\n🎓 Student Data Viewer")
        print(f"Server: {BASE_URL}")
        
        # Get password (default to test123 for test.student)
        if username == "test.student":
            password = "test123"
        else:
            password = getpass("Enter password: ")
        
        login_and_get_data(username, password)
        
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Connection Error: Make sure the server is running at {BASE_URL}")
        print("Run the server with: uvicorn app:app --reload")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    main() 