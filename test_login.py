import requests
from requests.exceptions import RequestException
from urllib.parse import urlencode
import subprocess

def verify_database_state():
    """Check database state for test users"""
    try:
        result = subprocess.run(
            ['docker', 'exec', '-i', 'demo-db-1', 'psql', '-U', 'postgres', '-d', 'postgres', '-f', 'verify_users.sql'],
            capture_output=True,
            text=True
        )
        print("\nDatabase state:")
        print("-" * 50)
        print(result.stdout)
    except Exception as e:
        print(f"Failed to verify database state: {e}")

def test_login(username: str, password: str) -> None:
    url = 'http://localhost:8000/api/v1/auth/login'
    
    # OAuth2 password grant format
    form_data = {
        'username': username,
        'password': password
    }
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
    }
    
    try:
        print(f"\nTesting login for {username}")
        print("-" * 50)
        
        response = requests.post(
            url,
            data=urlencode(form_data),
            headers=headers
        )
        
        print("Request:")
        print(f"URL: {url}")
        print(f"Headers: {headers}")
        print(f"Form Data: {form_data}")
        
        print("\nResponse:")
        print(f"Status: {response.status_code}")
        print(f"Body: {response.text}")
        
        if response.status_code == 401:
            print("\nAuthentication failed - Verifying user state...")
            verify_database_state()
            
    except RequestException as e:
        print(f"Request failed: {e}")
        return None

if __name__ == '__main__':
    test_accounts = [
        ('testuser1@test.com', 'Test123!'),
        ('testuser2@test.com', 'Test123!')
    ]
    
    # First verify database state
    print("Verifying database state before tests...")
    verify_database_state()
    
    print("\nTesting logins...")
    for username, password in test_accounts:
        test_login(username, password)

# ...existing code...

if __name__ == '__main__':
    test_accounts = [
        ('testuser1@test.com', 'Test123!'),
        ('testuser2@test.com', 'Test123!')
    ]
    
    # First create test users
    print("Creating test users...")
    try:
        result = subprocess.run(
            ['docker', 'exec', '-i', 'demo-db-1', 'psql', '-U', 'postgres', '-d', 'postgres', '-f', 'create_test_users.sql'],
            capture_output=True,
            text=True
        )
        print("Database output:")
        print(result.stdout)
        if result.stderr:
            print("Errors:")
            print(result.stderr)
    except Exception as e:
        print(f"Error creating users: {e}")
    
    # Then verify database state
    print("\nVerifying database state...")
    verify_database_state()
    
    print("\nTesting logins...")
    for username, password in test_accounts:
        test_login(username, password)