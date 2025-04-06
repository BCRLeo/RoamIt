from datetime import date, datetime
from io import BytesIO
import re
from flask import Blueprint, jsonify, request, send_file
from flask_login import current_user, login_user
from werkzeug.security import generate_password_hash
from ..models import ProfilePicture, Tag, User
from ..extensions import db

accounts = Blueprint('accounts', __name__)

USERNAME_REGEX = r"^[A-Za-z][\w.]{3,30}$"
EMAIL_REGEX = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
PASSWORD_REGEX = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&-]{8,}$"

@accounts.route("/users", methods = ["POST"])
def sign_up():
    data = request.get_json(silent = True)
    if not data:
        return jsonify({"error": "Missing form data."}), 400
    
    email = data.get("email")
    username = data.get("username")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    password = data.get("password")
    birthday_str = data.get("birthday")
    gender = data.get("gender")
    
    if not email or not username or not first_name or not last_name or not password or not birthday_str or not gender:
        return jsonify({"error": "Missing form data."}), 400
    
    # Validate email format
    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Invalid email format."}), 400
    
    if not re.match(USERNAME_REGEX, username):
        return jsonify({"error": "Invalid username format."}), 400
    
    # Validate password format using regex
    if not re.match(PASSWORD_REGEX, password):
        return jsonify({"error": "Invalid password format."}), 400
    
    # Convert the string 'YYYY-MM-DD' to a Python date object
    try:
        birthday = datetime.strptime(birthday_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format."}), 400
    
    # Check if user exists
    if db.session.execute(db.select(User).filter_by(email = email)).scalar_one_or_none():
        return jsonify({"error": "Email address already in use."}), 400
    
    if db.session.execute(db.select(User).filter_by(username = username)).scalar_one_or_none():
        return jsonify({"error": "Username already in use."}), 400
    
    # Create new user
    new_user = User(
        email = email,
        username = username,
        first_name = first_name,
        last_name = last_name,
        password = generate_password_hash(password, method='pbkdf2:sha256'),
        birthday = birthday,
        creation_date = date.today(),
        gender = gender
    )
    
    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)
    
    return jsonify({
        "data": {
            "userId": current_user.id,
            "firstName": current_user.first_name,
            "lastName": current_user.last_name,
            "username": current_user.username,
            "email": current_user.email
        }
        }), 201

@accounts.route("/users/<int:user_id>", methods = ["GET"])
def get_user_from_id(user_id: int):
    privacy = request.args.get("privacy")
    user = db.session.execute(db.select(User).filter_by(id = user_id)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "ID not associated to a user."}), 404
    
    if privacy and privacy == "public":
        return jsonify({
            "data": {
                "userId": user.id,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "username": user.username
            }
        }), 200
    
    if current_user.is_authenticated and current_user.id == user_id:
        return jsonify({
            "data": {
                "userId": current_user.id,
                "firstName": current_user.first_name,
                "lastName": current_user.last_name,
                "username": current_user.username,
                "email": current_user.email
            }
        }), 200
    
    return jsonify({"error": "User not authenticated."}), 401

@accounts.route("/users/email/<email>", methods = ["GET"])
def get_user_from_email(email: str):
    user = db.session.execute(db.select(User).filter_by(email = email)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "Email not associated to a user."}), 404
    
    if not current_user.is_authenticated or current_user.email != email:
        return jsonify({"error": "User not authenticated."}), 401
    
    return jsonify({
        "data": {
            "userId": current_user.id,
            "firstName": current_user.first_name,
            "lastName": current_user.last_name,
            "username": current_user.username,
            "email": current_user.email
        }
    }), 200

@accounts.route("/users/username/<username>", methods = ["GET"])
def get_user_from_username(username: str):
    privacy = request.args.get("privacy")
    user = db.session.execute(db.select(User).filter_by(username = username)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "Username not associated to a user."}), 404
    
    if privacy and privacy == "public":
        return jsonify({
            "data": {
                "userId": user.id,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "username": user.username
            }
        }), 200
    
    if current_user.is_authenticated and current_user.username == username:
        return jsonify({
        "data": {
            "userId": current_user.id,
            "firstName": current_user.first_name,
            "lastName": current_user.last_name,
            "username": current_user.username,
            "email": current_user.email
        }
        }), 200

    return jsonify({"error": "User not authenticated."}), 401

@accounts.route("/users/profile-picture", methods = ["POST"])
def upload_profile_picture():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not authenticated."}), 401
    
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    try:
        file_data = file.read()
        file_type = file.content_type
        
        if not file_type.startswith('image/'):
            return jsonify({"error": "Invalid file type."}), 400

        if len(file_data) > 5 * 1024 * 1024:  # 5MB limit
            return jsonify({"error": "Image too large."}), 400

        profile_picture = ProfilePicture(user_id = current_user.id, image_data = file_data, image_mimetype = file_type)
        db.session.add(profile_picture)
        db.session.commit()

        return "", 204
    except Exception as error:
        print(f"Error uploading profile picture: {error}")
        db.session.rollback()
        
        return jsonify({"error": error}), 500

@accounts.route("/users/<int:user_id>/profile-picture", methods = ["GET"])
def get_profile_picture_from_user_id(user_id: int):
    try:
        user = db.session.execute(db.select(User).filter_by(id = user_id)).scalar_one_or_none()
        
        if not user:
            return jsonify({"error": f"User #{user_id} not found."}), 404

        profile_picture = user.profile_pictures.order_by(ProfilePicture.timestamp.desc()).first()
        
        if not profile_picture:
            return "", 204
        
        return send_file(BytesIO(profile_picture.image_data), profile_picture.image_mimetype), 200
    except Exception as error:
        print(f"Error retrieving profile picture for user {user.username}: {error}")
        return jsonify({"error": "Failed to retrieve profile picture."}), 500

@accounts.route("/users/username/<username>/profile-picture", methods = ["GET"])
def get_profile_picture_from_username(username: str):
    user = db.session.execute(db.select(User).filter_by(username = username)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User {username} not found."}), 404
    
    return get_profile_picture_from_user_id(user.id)

@accounts.route("/users/profile-picture", methods = ["GET"])
def get_profile_picture():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not authenticated."}), 401
    
    return get_profile_picture_from_user_id(current_user.id)

@accounts.route("/users/bio", methods = ["POST"])
def upload_bio():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not authenticated."}), 401
    
    try:
        data = request.data
        bio = data.decode()
    except UnicodeDecodeError:
        return jsonify({"error": "Invalid UTF-8 encoding in request body"}), 400
    except Exception as error:
        return jsonify({"error": str(error)}), 400
    
    if not bio:
        return jsonify({"error": "No bio provided."}), 400
    
    try:
        current_user.bio = bio
        db.session.commit()
        
        return "", 200
    except Exception as error:
        print(f"Error uploading bio:", error)
        db.session.rollback()
        
        return jsonify({"error": "Error uploading bio."}), 500

@accounts.route("/users/<int:user_id>/bio", methods = ["GET"])
def get_bio_from_user_id(user_id: int):
    user = db.session.execute(db.select(User).filter_by(id = user_id)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User #{user_id} not found."}), 404
    
    bio = user.bio
    
    if not bio:
        return jsonify({"data": ""}), 200
    
    return jsonify({"data": bio}), 200

@accounts.route("/users/<username>/bio", methods = ["GET"])
def get_bio_from_username(username: str):
    user = db.session.execute(db.select(User).filter_by(username = username)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User {username} not found."}), 404
    
    bio = user.bio
    
    if not bio:
        return jsonify({"data": ""}), 200
    
    return jsonify({"data": bio}), 200

@accounts.route("/users/bio", methods = ["DELETE"])
def delete_bio():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not authenticated."}), 401
    
    try:
        current_user.bio = None
        db.session.commit()
        
        return "", 204
    except Exception as error:
        print(f"Error deleting bio: {error}")
        db.session.rollback()
        
        return jsonify({"error": error}), 500

@accounts.route("/users/tags", methods = ["POST"])
def upload_interests():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not authenticated."}), 401
    
    data = request.get_json(silent = True)
    
    if not data:
        return jsonify({"error": "No tags provided."}), 400
    
    try:
        for tag_name in data:
            tag = db.session.execute(db.select(Tag).filter_by(name = str(tag_name))).scalar_one_or_none()
            
            if not tag:
                tag = Tag(name = tag_name)
                current_user.tags.append(tag)
            elif tag not in current_user.tags:
                current_user.tags.append(tag)
        
        db.session.commit()
        
        return "", 200
    except Exception as error:
        print(f"Error uploading interests: {error}")
        db.session.rollback()
        
        return jsonify({"error": error}), 500

@accounts.route("/users/<int:user_id>/tags", methods = ["GET"])
def get_tags_from_user_id(user_id: int):
    user = db.session.execute(db.select(User).filter_by(id = user_id)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User #{user_id} not found."}), 404
    
    tags = user.tags
    
    if not tags:
        return jsonify({"data": ""}), 200
    
    tag_names = [tag.name for tag in tags]
    return jsonify({"data": tag_names}), 200

@accounts.route("/users/<username>/tags", methods = ["GET"])
def get_tags_from_username(username: int):
    user = db.session.execute(db.select(User).filter_by(username = username)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User {username} not found."}), 404
    
    tags = user.tags
    
    if not tags:
        return jsonify({"data": ""}), 200
    
    tag_names = [tag.name for tag in tags]
    return jsonify({"data": tag_names}), 200

@accounts.route("/users/tags", methods = ["DELETE"])
def delete_tags():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not authenticated."}), 401
    
    if not len(current_user.tags):
        return "", 204
    
    data = request.get_json(silent = True)
    
    if not data:
        try:
            current_user.tags.clear()
            db.session.commit()
            
            return "", 204
        except Exception as error:
            print(f"Error uploading interests: {error}")
            db.session.rollback()
            
            return jsonify({"error": error}), 500
    
    try:
        for tag_name in data:
            tag = db.session.execute(db.select(Tag).filter_by(name = str(tag_name))).scalar_one_or_none()
            
            if not tag:
                continue
            
            current_user.tags.remove(tag)
        
        db.session.commit()
        
        return "", 200
    except Exception as error:
        print(f"Error uploading interests: {error}")
        db.session.rollback()
        
        return jsonify({"error": error}), 500