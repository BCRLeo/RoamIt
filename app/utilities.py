from requests.exceptions import HTTPError

class CustomHTTPError(HTTPError):
    def __init__(self, message: str, status_code: int):
        super().__init__(message)
        self.status_code = status_code

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

def similarity(reference: list, target: list):
    """Calculate asymmetric similarity of reference with target."""
    if not len(reference):
        return 0

    return len(set(reference).intersection(set(target))) / len(reference)