BEGIN;

-- Update passwords with newly generated hash
UPDATE students 
SET hashed_password = '$2b$12$uwZlshHotUAnStUXSOWOLe/PAkiRfg4Kzz7kC/af0IGk8GzLaLlDi',
    failed_login_attempts = 0,
    locked_until = NULL,
    is_active = true
WHERE email IN ('test@student.edu', 'alice.brown@student.edu');

-- Verify the update
SELECT 
    email,
    is_active,
    failed_login_attempts,
    substring(hashed_password, 1, 20) as hash_prefix
FROM students 
WHERE email IN ('test@student.edu', 'alice.brown@student.edu');

COMMIT;