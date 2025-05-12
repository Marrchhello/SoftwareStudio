from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Generate hash for test password
password = "testpass123"
hashed = get_password_hash(password)
print(f"Password hash for '{password}':")
print(hashed) 