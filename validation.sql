-- Check test users state
SELECT 
    email,
    is_active,
    failed_login_attempts,
    substring(hashed_password, 1, 20) as hash_prefix
FROM students 
WHERE email IN ('testuser1@test.com', 'testuser2@test.com');