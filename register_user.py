import requests

def test_registration():
    """Simple test with correct parameters for student registration"""
    
    user_data = {
        "role": "student",
        "user_id": 33,
        "email": "john.doe@university.com", 
        "username": "1",
        "password": "1",
        "semester": 1,
        "degreeId": 1  # Required for student registration
    }

    try:
        response = requests.post(
            'http://localhost:8000/register',
            params=user_data,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Registration successful!")
            
            # Test token
            print("\nTesting token generation...")
            token_response = requests.post(
                'http://localhost:8000/token',
                data={
                    'username': user_data['username'],
                    'password': user_data['password']
                }
            )
            
            print(f"Token Status: {token_response.status_code}")
            print(f"Token Response: {token_response.text}")
            
            if token_response.status_code == 200:
                print("✅ Token generation successful!")
                
                # Test grades
                token = token_response.json()['access_token']
                print(f"\nTesting grades retrieval...")
                
                grades_response = requests.get(
                    f'http://localhost:8000/student/{user_data["user_id"]}/grades',
                    headers={'Authorization': f'Bearer {token}'}
                )
                
                print(f"Grades Status: {grades_response.status_code}")
                print(f"Grades Response: {grades_response.text}")
                
                if grades_response.status_code == 200:
                    print("✅ Full flow successful!")
                else:
                    print("❌ Grades retrieval failed")
            else:
                print("❌ Token generation failed")
        else:
            print("❌ Registration failed")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is it running on localhost:8000?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_registration()