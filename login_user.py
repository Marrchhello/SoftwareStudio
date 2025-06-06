import requests
import json
from typing import Optional, Dict, Any

def login_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Login a user and return their access token and user information.
    
    Args:
        username (str): The username of the user
        password (str): The user's password
        
    Returns:
        Optional[Dict[str, Any]]: Dictionary containing access token and user info if successful,
                                None if login fails
    """
    try:
        # Attempt to get token
        token_response = requests.post(
            'http://127.0.0.1:8000/token',
            data={
                'username': username,
                'password': password
            }
        )
        
        if token_response.status_code == 200:
            token_data = token_response.json()
            print("Login successful!")
            return token_data
        else:
            print(f"Login failed. Status code: {token_response.status_code}")
            print(f"Error message: {token_response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Error during login: {str(e)}")
        return None

if __name__ == "__main__":
    # Example usage
    username = input("Enter your username: ")
    password = input("Enter your password: ")
    
    result = login_user(username, password)
    
    if result:
        print("\nAccess token:", result.get('access_token'))
        # You can use this token for subsequent authenticated requests
        # Example:
        # headers = {'Authorization': f'Bearer {result["access_token"]}'}
        # response = requests.get('http://localhost:8000/protected-endpoint', headers=headers) 