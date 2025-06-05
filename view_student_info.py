import requests
import json
from datetime import datetime

def print_grades(grades):
    print("\n=== Grades ===")
    for grade in grades["GradeList"]:
        print(f"\nCourse: {grade['Course']}")
        if grade['Grade'] is not None:
            print(f"Grade: {grade['Grade']:.1f}%")
            print(f"AGH Grade: {grade['AGH_Grade']}")
        else:
            print("Grade: Not yet graded")

def print_schedule(schedule):
    print("\n=== Schedule ===")
    
    if schedule["Classes"]:
        print("\nClasses:")
        for class_ in schedule["Classes"]:
            start = datetime.fromisoformat(class_["ClassTime"]["StartDateTime"].replace("Z", "+00:00"))
            end = datetime.fromisoformat(class_["ClassTime"]["EndDateTime"].replace("Z", "+00:00"))
            print(f"\n{class_['CourseName']}")
            print(f"Time: {start.strftime('%Y-%m-%d %H:%M')} - {end.strftime('%H:%M')}")
            if class_["isBiWeekly"]:
                print("(Bi-weekly)")
    
    if schedule["Events"]:
        print("\nEvents:")
        for event in schedule["Events"]:
            start = datetime.fromisoformat(event["EventTime"]["StartDateTime"].replace("Z", "+00:00"))
            end = datetime.fromisoformat(event["EventTime"]["EndDateTime"].replace("Z", "+00:00"))
            print(f"\n{event['EventName']}")
            print(f"Time: {start.strftime('%Y-%m-%d %H:%M')} - {end.strftime('%H:%M')}")
            if event["IsHoliday"]:
                print("(Holiday)")
    
    if schedule["Assignments"]:
        print("\nAssignments:")
        for assignment in schedule["Assignments"]:
            due = datetime.fromisoformat(assignment["AssignmentDueDateTime"].replace("Z", "+00:00"))
            print(f"\n{assignment['AssignmentName']} ({assignment['CourseName']})")
            print(f"Due: {due.strftime('%Y-%m-%d %H:%M')}")

def main():
    
    # Get the access token from the user
    access_token = input("Please enter your access token: ").strip()
    
    # Set up the headers with the token
    # Update the headers setup
    headers = {
    "Authorization": f"Bearer {access_token.strip()}",
    "Accept": "application/json"
    }
    print(f"DEBUG: Request headers: {headers}")
    
    # The base URL for the API
    base_url = "http://localhost:8000"
    
    try:
        # First, get user info to verify the token and get the student ID
        response = requests.get(f"{base_url}/me", headers=headers)
        if response.status_code != 200:
            print("❌ Failed to get user info. Please check your token.")
            return
        
        user_info = response.json()
        student_id = user_info["role_id"]
        
        print(f"\n✅ Logged in as student {student_id}")
        
        while True:
            print("\nWhat would you like to view?")
            print("1. Grades")
            print("2. Today's Schedule")
            print("3. Week Schedule")
            print("4. Month Schedule")
            print("5. Exit")
            
            choice = input("\nEnter your choice (1-5): ").strip()
            
            if choice == "1":
                # Get grades
                response = requests.get(f"{base_url}/student/{student_id}/grades", headers=headers)
                if response.status_code == 200:
                    print_grades(response.json())
                else:
                    print(f"❌ Failed to get grades: {response.text}")
            
            elif choice == "2":
                # Get today's schedule
                response = requests.get(f"{base_url}/student/{student_id}/schedule/day/", headers=headers)
                if response.status_code == 200:
                    print_schedule(response.json())
                else:
                    print(f"❌ Failed to get today's schedule: {response.text}")
            
            elif choice == "3":
                # Get week schedule
                response = requests.get(f"{base_url}/student/{student_id}/schedule/week/", headers=headers)
                if response.status_code == 200:
                    print_schedule(response.json())
                else:
                    print(f"❌ Failed to get week schedule: {response.text}")
            
            elif choice == "4":
                # Get month schedule
                response = requests.get(f"{base_url}/student/{student_id}/schedule/month/", headers=headers)
                if response.status_code == 200:
                    print_schedule(response.json())
                else:
                    print(f"❌ Failed to get month schedule: {response.text}")
            
            elif choice == "5":
                print("\nGoodbye!")
                break
            
            else:
                print("\n❌ Invalid choice. Please enter a number between 1 and 5.")
            
            input("\nPress Enter to continue...")

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is it running on localhost:8000?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main() 