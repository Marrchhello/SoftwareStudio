-- Create or update test users with bcrypt hashed passwords
INSERT INTO students (
    name,
    email,
    semester,
    year,
    degree_id,
    age,
    hashed_password,
    is_active,
    failed_login_attempts
) VALUES
    ('Test Student', 'test@student.edu', 1, 2024, 1, 19, '$2b$12$QUwW2mZ3Z236e2Q8yAmbAu.gELz28Qx.WbT63DhP0jCUyrISEKcpO', true, 0),
    ('Alice Brown', 'alice.brown@student.edu', 3, 2023, 1, 20, '$2b$12$QUwW2mZ3Z236e2Q8yAmbAu.gELz28Qx.WbT63DhP0jCUyrISEKcpO', true, 0)
ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    failed_login_attempts = 0,
    locked_until = NULL,
    is_active = true;