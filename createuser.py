import requests
import json

def create_student():
    url = "http://localhost:8000/api/v1/students/"
    
    # Student data matching your StudentCreate schema
    data = {
        "email": "test.student@example.com",
        "password": "password123",
        "name": "Test Student",
        "semester": 1,
        "year": 2024,
        "degree_id": 1,
        "age": 20
    }
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"\nRequest:")
        print(f"URL: {url}")
        print(f"Headers: {headers}")
        print(f"Data: {json.dumps(data, indent=2)}")
        
        print(f"\nResponse:")
        print(f"Status: {response.status_code}")
        print(f"Body: {json.dumps(response.json(), indent=2) if response.text else ''}")
        
        return response.json() if response.status_code == 200 else None
        
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return None

if __name__ == "__main__":
    print("Creating new student...")
    create_student()