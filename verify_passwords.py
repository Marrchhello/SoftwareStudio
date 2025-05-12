import bcrypt

def test_password_combinations():
    # Known hashes from our SQL files
    hash_combinations = [
        {
            "description": "Hash from init.sql (most students)",
            "hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBAQN3JxGqJQHy",
        },
        {
            "description": "Hash from init.sql (test student)",
            "hash": "$2b$12$K4OEohDpwj8.v8P.xz97X.UWkXxTxKaB.EZF/wBjpWOYjdfKSNnX6",
        },
        {
            "description": "Hash from update_passwords.sql",
            "hash": "$2b$12$uwZlshHotUAnStUXSOWOLe/PAkiRfg4Kzz7kC/af0IGk8GzLaLlDi",
        }
    ]
    
    # Test passwords to try
    test_passwords = ['password123', 'testpass123', 'Password123!']
    
    print("Password Verification Test")
    print("=" * 50)
    
    for password in test_passwords:
        print(f"\nTesting password: {password}")
        print("-" * 30)
        
        for combo in hash_combinations:
            try:
                is_valid = bcrypt.checkpw(
                    password.encode('utf-8'),
                    combo["hash"].encode('utf-8')
                )
                print(f"\nSource: {combo['description']}")
                print(f"Hash: {combo['hash']}")
                print(f"Valid: {is_valid}")
            except Exception as e:
                print(f"Error checking hash: {e}")

if __name__ == '__main__':
    test_password_combinations()