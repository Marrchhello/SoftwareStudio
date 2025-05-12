-- Update test teacher accounts with the correct password hash
UPDATE teachers 
SET hashed_password = '$2b$12$QUwW2mZ3Z236e2Q8yAmbAu.gELz28Qx.WbT63DhP0jCUyrISEKcpO'
WHERE email IN ('john.smith@university.edu', 'mary.johnson@university.edu');

-- Reset any failed login attempts and locks
UPDATE teachers
SET failed_login_attempts = 0,
    locked_until = NULL
WHERE email IN ('john.smith@university.edu', 'mary.johnson@university.edu'); 