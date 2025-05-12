import bcrypt

def generate_password_hash(password: str) -> str:
    """Generate a new bcrypt hash for the given password"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False

def test_password_hash():
    # Test data
    test_password = 'password123'
    
    # Generate a new hash
    new_hash = generate_password_hash(test_password)
    print(f"Generated new hash for '{test_password}':")
    print(f"NEW HASH: {new_hash}")
    
    # Verify the new hash
    is_valid = verify_password(test_password, new_hash)
    print(f"\nPassword verification test: {is_valid}")
    
    # Print SQL command to update database
    print("\nUse this SQL to update the database:")
    print("----------------")
    print(f"""UPDATE students 
SET hashed_password = '{new_hash}',
    failed_login_attempts = 0,
    locked_until = NULL,
    is_active = true
WHERE email IN ('test@student.edu', 'alice.brown@student.edu');""")

if __name__ == '__main__':
    test_password_hash()