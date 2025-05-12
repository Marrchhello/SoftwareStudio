Get-Content "c:\Users\Ostap\demo\demo\validation.sql" 
-- Check test users state
SELECT
    email,
    is_active,
    failed_login_attempts,
    substring(hashed_password, 1, 20) as hash_prefix
FROM students
WHERE email IN ('testuser1@test.com', 'testuser2@test.com');
PS C:\Users\Ostap\demo\demo> python test_login.py
Verifying database state before tests...

Database state:
--------------------------------------------------


Testing logins...

Testing login for testuser1@test.com
--------------------------------------------------
Request:
URL: http://localhost:8000/api/v1/auth/login
Headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'}
Form Data: {'username': 'testuser1@test.com', 'password': 'Test123!'}

Response:
Status: 401
Body: {"detail":"Incorrect email or password"}

Authentication failed - Verifying user state...

Database state:
--------------------------------------------------


Testing login for testuser2@test.com
--------------------------------------------------
Request:
URL: http://localhost:8000/api/v1/auth/login
Headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'}
Form Data: {'username': 'testuser2@test.com', 'password': 'Test123!'}

Response:
Status: 401
Body: {"detail":"Incorrect email or password"}

Authentication failed - Verifying user state...

Database state:
--------------------------------------------------

PS C:\Users\Ostap\demo\demo> 