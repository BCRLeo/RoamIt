def can_convert_to_float(value):
    try:
        float(value)
        return True
    except ValueError:
        return False

def can_convert_to_int(value):
    try:
        int(value)
        return True
    except ValueError:
        return False
    
def string_to_bool(value: str):
    """Convert a string to a boolean (handles 'true', 'false', '1', '0')"""
    return value.lower() in ["true", "1"]