from datetime import date, datetime
from io import BytesIO
import re
from flask import Blueprint, jsonify, request, send_file
from flask_login import current_user, login_required, login_user
from werkzeug.security import generate_password_hash
from ..models import ProfilePicture, Tag, User, Friendship
from ..extensions import db

accounts = Blueprint('accounts', __name__)

USERNAME_REGEX = r"^[A-Za-z][\w.]{3,30}$"
EMAIL_REGEX = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
PASSWORD_REGEX = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&-]{8,}$"
PHONE_REGEX = r"^\+?\d{7,15}$"

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
            "id": current_user.id,
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
                "id": user.id,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "username": user.username
            }
        }), 200
    
    if current_user.is_authenticated and current_user.id == user_id:
        return jsonify({
            "data": {
                "id": current_user.id,
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
            "id": current_user.id,
            "firstName": current_user.first_name,
            "lastName": current_user.last_name,
            "username": current_user.username,
            "email": current_user.email
        }
    }), 200

@accounts.route("/users/@<username>", methods = ["GET"])
def get_user_from_username(username: str):
    privacy = request.args.get("privacy")
    user = db.session.execute(db.select(User).filter_by(username = username)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "Username not associated to a user."}), 404
    
    if privacy and privacy == "public":
        return jsonify({
            "data": {
                "id": user.id,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "username": user.username
            }
        }), 200
    
    if current_user.is_authenticated and current_user.username == username:
        return jsonify({
        "data": {
            "id": current_user.id,
            "firstName": current_user.first_name,
            "lastName": current_user.last_name,
            "username": current_user.username,
            "email": current_user.email
        }
        }), 200

    return jsonify({"error": "User not authenticated."}), 401

@accounts.route("/users/profile-picture", methods = ["POST"])
@login_required
def upload_profile_picture():    
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

@accounts.route("/users/@<username>/profile-picture", methods = ["GET"])
def get_profile_picture_from_username(username: str):
    user = db.session.execute(db.select(User).filter_by(username = username)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User @{username} not found."}), 404
    
    return get_profile_picture_from_user_id(user.id)

@accounts.route("/users/profile-picture", methods = ["GET"])
@login_required
def get_profile_picture():    
    return get_profile_picture_from_user_id(current_user.id)

@accounts.route("/users/bio", methods = ["POST"])
@login_required
def upload_bio():
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
        print("Error uploading bio:", error)
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

@accounts.route("/users/@<username>/bio", methods = ["GET"])
def get_bio_from_username(username: str):
    user = db.session.execute(db.select(User).filter_by(username = username)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User @{username} not found."}), 404
    
    bio = user.bio
    
    if not bio:
        return jsonify({"data": ""}), 200
    
    return jsonify({"data": bio}), 200

@accounts.route("/users/bio", methods = ["DELETE"])
@login_required
def delete_bio():
    try:
        current_user.bio = None
        db.session.commit()
        
        return "", 204
    except Exception as error:
        print(f"Error deleting bio: {error}")
        db.session.rollback()
        
        return jsonify({"error": error}), 500

@accounts.route("/users/tags", methods = ["POST"])
@login_required
def upload_tags():
    data = request.get_json(silent = True)
    
    if not data:
        return jsonify({"error": "No tags provided."}), 400
    
    try:
        current_user.tags.clear()
        
        for tag_name in data:
            tag = db.session.execute(db.select(Tag).filter_by(name = str(tag_name))).scalar_one_or_none()
            
            if not tag:
                tag = Tag(name = tag_name)
            
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

@accounts.route("/users/@<username>/tags", methods = ["GET"])
def get_tags_from_username(username: int):
    user = db.session.execute(db.select(User).filter_by(username = username)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User @{username} not found."}), 404
    
    tags = user.tags
    
    if not tags:
        return jsonify({"data": ""}), 200
    
    tag_names = [tag.name for tag in tags]
    return jsonify({"data": tag_names}), 200

@accounts.route("/users/tags", methods = ["DELETE"])
@login_required
def delete_tags():
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
    
@accounts.route("/users/phone", methods=["POST"])
@login_required
def upload_phone_number():    
    try:
        data = request.data.decode()
        if not data:
            return jsonify({"error": "No phone number provided."}), 400
        
        if not re.match(PHONE_REGEX, data):
            return jsonify({"error": "Invalid phone number format."}), 400

        current_user.phone_number = data
        db.session.commit()
        return "", 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update phone number: {str(e)}"}), 500
    
@accounts.route("/users/<int:user_id>/phone", methods=["GET"])
def get_phone_number_by_user_id(user_id: int):
    user = db.session.execute(db.select(User).filter_by(id=user_id)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "User not found."}), 404

    # Restrict to owner of profile
    if not current_user.is_authenticated or current_user.id != user_id:
        return jsonify({"error": "Unauthorized access to phone number."}), 403

    if not user.phone_number:
        return jsonify({"error": "No phone number found."}), 404

    return jsonify({"data": user.phone_number}), 200

@accounts.route("/users/phone", methods=["DELETE"])
@login_required
def delete_phone():
    try:
        current_user.phone_number = None
        db.session.commit()
        return "", 204
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": str(error)}), 500

# Send a friend request to a user by username
@accounts.route("/users/@<username>/friends", methods=["POST"])
@login_required
def send_friend_request(username: str):
    receiver = db.session.execute(
        db.select(User).filter_by(username=username)
    ).scalar_one_or_none()

    if not receiver:
        return jsonify({"error": f"User @{username} not found."}), 404

    if current_user.id == receiver.id:
        return jsonify({"error": "Cannot send a friend request to yourself."}), 400

    existing = db.session.execute(
        db.select(Friendship).filter_by(requester_id=current_user.id, receiver_id=receiver.id)
    ).scalar_one_or_none()

    if existing:
        return jsonify({"error": "Friend request already sent."}), 400

    friendship = Friendship(
        requester_id=current_user.id,
        receiver_id=receiver.id,
        status="pending"
    )

    db.session.add(friendship)
    db.session.commit()

    return jsonify({"message": f"Friend request sent to @{username}."}), 200


# Accept a friend request
@accounts.route("/users/@<username>/friends", methods=["PATCH"])
@login_required
def accept_friend_request(username: str):
    requester = db.session.execute(
        db.select(User).filter_by(username=username)
    ).scalar_one_or_none()

    if not requester:
        return jsonify({"error": f"User @{username} not found."}), 404

    friendship = db.session.execute(
        db.select(Friendship).filter_by(
            requester_id=requester.id,
            receiver_id=current_user.id,
            status="pending"
        )
    ).scalar_one_or_none()

    if not friendship:
        return jsonify({"error": "No pending friend request from this user."}), 404

    friendship.status = "accepted"
    db.session.commit()

    return jsonify({"message": f"You are now friends with @{username}."}), 200


# Remove a friend
@accounts.route("/users/@<username>/friends", methods=["DELETE"])
@login_required
def remove_friend(username: str):
    other = db.session.execute(
        db.select(User).filter_by(username=username)
    ).scalar_one_or_none()

    if not other:
        return jsonify({"error": f"User @{username} not found."}), 404

    friendship = db.session.execute(
        db.select(Friendship).filter(
            ((Friendship.requester_id == current_user.id) & (Friendship.receiver_id == other.id)) |
            ((Friendship.requester_id == other.id) & (Friendship.receiver_id == current_user.id)),
            Friendship.status == "accepted"
        )
    ).scalar_one_or_none()

    if not friendship:
        return jsonify({"error": "No active friendship found."}), 404

    db.session.delete(friendship)
    db.session.commit()

    return jsonify({"message": f"Friendship with @{username} removed."}), 200


# View incoming friend requests
@accounts.route("/users/friend-requests", methods=["GET"])
@login_required
def view_friend_requests():
    pending = db.session.execute(
        db.select(Friendship).filter_by(receiver_id=current_user.id, status="pending")
    ).scalars().all()

    return jsonify({
        "data": [
            {
                "requesterId": fr.requester_id,
                "timestamp": fr.timestamp.isoformat()
            }
            for fr in pending
        ]
    }), 200


# View list of accepted friends
@accounts.route("/users/@<username>/friends", methods=["GET"])
def get_friend_list(username: str):
    user = db.session.execute(
        db.select(User).filter_by(username=username)
    ).scalar_one_or_none()

    if not user:
        return jsonify({"error": f"User @{username} not found."}), 404

    friendships = db.session.execute(
        db.select(Friendship).filter(
            ((Friendship.requester_id == user.id) | (Friendship.receiver_id == user.id)),
            Friendship.status == "accepted"
        )
    ).scalars().all()

    friend_ids = [
        fr.receiver_id if fr.requester_id == user.id else fr.requester_id
        for fr in friendships
    ]

    friends = db.session.execute(
        db.select(User).filter(User.id.in_(friend_ids))
    ).scalars().all()

    return jsonify({
        "data": [
            {
                "userId": f.id,
                "username": f.username,
                "firstName": f.first_name,
                "lastName": f.last_name,
                "profilePicUrl": f"/api/users/{f.id}/profile-picture"
            } for f in friends
        ]
    }), 200
