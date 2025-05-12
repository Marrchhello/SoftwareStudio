import requests
from requests.exceptions import RequestException
from urllib.parse import urlencode

def debug_login(username: str, password: str) -> None:
    url = 'http://localhost:8000/api/v1/auth/login'
    
    # Test cases with different formats
    test_cases = [
        {
            'name': 'Form URL-encoded with grant_type',
            'headers': {'Content-Type': 'application/x-www-form-urlencoded'},
            'data': {
                'username': username,
                'password': password,
                'grant_type': 'password'
            },
            'encode': True
        },
        {
            'name': 'JSON with grant_type',
            'headers': {'Content-Type': 'application/json'},
            'data': {
                'username': username,
                'password': password,
                'grant_type': 'password'
            },
            'encode': False
        }
    ]
    
    for test in test_cases:
        print(f"\nTrying: {test['name']}")
        print("-" * 50)
        
        try:
            # Add Accept header
            test['headers']['Accept'] = 'application/json'
            
            # Handle data encoding
            request_data = urlencode(test['data']) if test['encode'] else test['data']
            request_kwargs = {
                'headers': test['headers'],
                'data' if test['encode'] else 'json': request_data
            }
            
            # Make request and print details
            print("Request:")
            print(f"URL: {url}")
            print(f"Headers: {test['headers']}")
            print(f"Data: {test['data']}")
            
            response = requests.post(url, **request_kwargs)
            
            print("\nResponse:")
            print(f"Status: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")
            print(f"Body: {response.text}")
            
            if response.status_code == 200:
                print("\nSUCCESS! Login worked with these parameters.")
                return response.json()
                
        except RequestException as e:
            print(f"Request failed: {e}")
    
    print("\nAll login attempts failed. Verify database state:")
    print(f'docker exec demo-db-1 psql -U postgres -d postgres -c "SELECT email, is_active, failed_login_attempts, hashed_password FROM students WHERE email=\'{username}\';"')
    return None

if __name__ == '__main__':
    test_accounts = [
        ('test@student.edu', 'password123'),
        ('alice.brown@student.edu', 'password123')
    ]
    
    for username, password in test_accounts:
        print(f"\nTesting account: {username}")
        print("=" * 50)
        debug_login(username, password)