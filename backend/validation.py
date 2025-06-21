import re
from typing import Tuple

def validate_password(password: str) -> Tuple[bool, str]:
    """
    Validate password according to requirements:
    - At least 8 characters long
    - Contains at least 1 digit
    - Contains at least 1 letter
    
    Args:
        password: The password to validate
        
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least 1 digit"
    
    if not re.search(r'[a-zA-Z]', password):
        return False, "Password must contain at least 1 letter"
    
    return True, "Password is valid"

def validate_name(name: str) -> Tuple[bool, str]:
    """
    Validate name according to requirements:
    - Must start with a capital letter
    
    Args:
        name: The name to validate
        
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """
    if not name or not name.strip():
        return False, "Name cannot be empty"
    
    if not name[0].isupper():
        return False, "Name must start with a capital letter"
    
    return True, "Name is valid"

def validate_surname(surname: str) -> Tuple[bool, str]:
    """
    Validate surname according to requirements:
    - Must start with a capital letter
    
    Args:
        surname: The surname to validate
        
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """
    if not surname or not surname.strip():
        return False, "Surname cannot be empty"
    
    if not surname[0].isupper():
        return False, "Surname must start with a capital letter"
    
    return True, "Surname is valid"

def validate_full_name(name: str) -> Tuple[bool, str]:
    """
    Validate full name (name and surname) according to requirements:
    - Must start with a capital letter
    
    Args:
        name: The full name to validate
        
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """
    if not name or not name.strip():
        return False, "Name cannot be empty"
    
    # Split the name into parts (handles multiple names/surnames)
    name_parts = name.strip().split()
    
    for part in name_parts:
        if not part[0].isupper():
            return False, f"All name parts must start with a capital letter. Found: '{part}'"
    
    return True, "Name is valid" 