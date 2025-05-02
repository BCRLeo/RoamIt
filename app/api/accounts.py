from datetime import date, datetime
from io import BytesIO
import re
from flask import Blueprint, current_app, jsonify, request, send_file
from flask_login import current_user, login_required, login_user
from werkzeug.security import generate_password_hash
from ..models import ProfilePicture, Tag, User
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
        
        return jsonify({"error": str(error)}), 500

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
        
        return "", 204
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
        return "", 204
    
    return jsonify({"data": bio}), 200

@accounts.route("/users/@<username>/bio", methods = ["GET"])
def get_bio_from_username(username: str):
    user = db.session.execute(db.select(User).filter_by(username = username)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User @{username} not found."}), 404
    
    bio = user.bio
    
    if not bio:
        return "", 204
    
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
        
        return jsonify({"error": str(error)}), 500

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
        
        return "", 204
    except Exception as error:
        print(f"Error uploading interests: {error}")
        db.session.rollback()
        
        return jsonify({"error": str(error)}), 500

@accounts.route("/users/<int:user_id>/tags", methods = ["GET"])
def get_tags_from_user_id(user_id: int):
    user = db.session.execute(db.select(User).filter_by(id = user_id)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User #{user_id} not found."}), 404
    
    tags = user.tags
    
    if not tags:
        return "", 204
    
    tag_names = [tag.name for tag in tags]
    return jsonify({"data": tag_names}), 200

@accounts.route("/users/@<username>/tags", methods = ["GET"])
def get_tags_from_username(username: int):
    user = db.session.execute(db.select(User).filter_by(username = username)).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User @{username} not found."}), 404
    
    tags = user.tags
    
    if not tags:
        return "", 204
    
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
            
            return jsonify({"error": str(error)}), 500
    
    try:
        for tag_name in data:
            tag = db.session.execute(db.select(Tag).filter_by(name = str(tag_name))).scalar_one_or_none()
            
            if not tag:
                continue
            
            current_user.tags.remove(tag)
        
        db.session.commit()
        
        return "", 204
    except Exception as error:
        print(f"Error uploading interests: {error}")
        db.session.rollback()
        
        return jsonify({"error": str(error)}), 500
    
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
        return "", 204
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

@accounts.post("/users/friends/@<username>")
@login_required
def send_friend_request_to_username(username: str):
    user: User | None = db.session.execute(
        db.select(User).filter_by(username = username)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User @{username} not found."}), 404
    
    if current_user.id == user.id:
        return jsonify({"error": "Cannot send a friend request to yourself."}), 400

    request = current_user.get_request_status_with(user)
    
    if not request or request["status"] == "declined":
        try:
            current_user.send_friend_request(user)
            return "", 204
        except Exception as error:
            return jsonify({"error": str(error)}), 500
    
    if request["status"] == "accepted":
        return jsonify({"error": f"User is already friends with @{username}."}), 400
    
    if request["requester_id"] == user.id:
        return jsonify({"error": "User already has an incoming friend request from @{username}."}), 400
    
    return jsonify({"error": "User already has an outgoing friend request to @{username}."}), 400

@accounts.patch("/users/friends/@<username>")
@login_required
def accept_friend_request_from_username(username: str):
    user: User | None = db.session.execute(
        db.select(User).filter_by(username = username)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User @{username} not found."}), 404
    
    if current_user.id == user.id:
        return jsonify({"error": "Cannot accept a friend request from yourself."}), 400
    
    request = current_user.get_request_status_with(user)
    
    if not request or request["status"] == "declined":
        return jsonify({"error": f"User does not have an incoming friend request from @{username}."}), 400
    
    if request["status"] == "accepted":
        return jsonify({"error": f"User is already friends with @{username}."}), 400
    
    if request["requester_id"] == current_user.id:
        return jsonify({"error": f"User does not have an incoming friend request from @{username}."}), 400
    
    try:
        current_user.accept_friend_request(user)
        return "", 204
    except Exception as error:
        return jsonify({"error": str(error)}), 500

@accounts.delete("/users/friends/@<username>")
def decline_or_remove_friend_by_username(username: str):
    user: User | None = db.session.execute(
        db.select(User).filter_by(username = username)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User @{username} not found."}), 404
    
    if current_user.id == user.id:
        return jsonify({"error": "There is no friendship with yourself."}), 400
    
    request = current_user.get_request_status_with(user)
    
    if not request or request["status"] == "declined":
        return jsonify({"error": "User does not have an incoming friend request from @{username}."}), 400
    
    if request["status"] == "accepted":
        current_user.remove_friend(user)
        return "", 204
    
    if request["requester_id"] == current_user.id:
        return jsonify({"error": "User does not have an incoming friend request from @{username}."}), 400
    
    try:
        current_user.decline_friend_request(user)
        return "", 204
    except Exception as error:
        return jsonify({"error": str(error)}), 500

@accounts.get("/users/friends")
@login_required
def get_friend_data():
    friends: list[User] = current_user.accepted_friend_requests.all()
    outgoing: list[User] = current_user.outgoing_friend_requests.all()
    incoming: list[User] = current_user.incoming_friend_requests.all()
    
    status = request.args.get("status")
    
    match status:
        case "accepted":
            return jsonify({"data": [user.to_dict() for user in friends]}), 200
        case "outgoing":
            return jsonify({"data": [user.to_dict() for user in outgoing]}), 200
        case "incoming":
            return jsonify({"data": [user.to_dict() for user in incoming]}), 200
        case _:
            return jsonify({
                "data": {
                    "accepted": [friend.to_dict() for friend in friends],
                    "outgoing": [requester.to_dict() for requester in outgoing],
                    "incoming": [requester.to_dict() for requester in incoming]
                }
            }), 200

@accounts.get("/users/<int:user_id>/friends")
def get_friend_data_from_user_id(user_id: int):
    user: User | None = db.session.execute(
        db.select(User).filter_by(id = user_id)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User #{user_id} not found."}), 404
    
    status = request.args.get("status")
    
    if status and status != "accepted" and (not current_user.is_authenticated or current_user.id != user.id):
        return current_app.login_manager.unauthorized()
    
    match status:
        case "accepted":
            friends: list[User] = user.accepted_friend_requests.all()
        case "outgoing":
            friends: list[User] = user.outgoing_friend_requests.all()
        case "incoming":
            friends: list[User] = user.incoming_friend_requests.all()
        case _:
            if current_user.is_authenticated and current_user.id == user.id:
                return get_friend_data()
            
            friends: list[User] = user.accepted_friend_requests.all()
    
    if not friends:
        return jsonify({"data": ""}), 204
    
    return jsonify({"data": [friend.to_dict() for friend in friends]}), 200

@accounts.get("/users/@<username>/friends")
def get_friend_data_from_username(username: str):
    user: User | None = db.session.execute(
        db.select(User).filter_by(username = username)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": f"User @{username} not found."}), 404
    
    status = request.args.get("status")
    
    if status and status != "accepted" and (not current_user.is_authenticated or current_user.id != user.id):
        return current_app.login_manager.unauthorized()
    
    match status:
        case "accepted":
            friends: list[User] = user.accepted_friend_requests.all()
        case "outgoing":
            friends: list[User] = user.outgoing_friend_requests.all()
        case "incoming":
            friends: list[User] = user.incoming_friend_requests.all()
        case _:
            if current_user.is_authenticated and current_user.id == user.id:
                print("hi")
                return get_friend_data()
            
            friends: list[User] = user.accepted_friend_requests.all()
    
    if not friends:
        return jsonify({"data": []}), 204
    print(friends)
    return jsonify({"data": [friend.to_dict() for friend in friends]}), 200

@accounts.get("/users/<int:user1_id>/friends/<int:user2_id>")
def get_friendship_status_between_user_ids(user1_id: int, user2_id: int):
    user1: User | None = db.session.execute(
        db.select(User).filter_by(id = user1_id)
    ).scalar_one_or_none()
    
    user2: User | None = db.session.execute(
        db.select(User).filter_by(id = user2_id)
    ).scalar_one_or_none()
    
    if not user1 and not user2:
        return jsonify({"error": f"Users #{user1_id} and #{user2_id} not found."}), 404
    elif not user1:
        return jsonify({"error": f"User #{user1_id} not found."}), 404
    elif not user2:
        return jsonify({"error": f"User #{user2_id} not found."}), 404
    
    if user1_id == user2_id:
        return jsonify({"error": "There is no friendship status between the user and themself."}), 400
    
    request = user1.get_request_status_with(user2)
    
    if not request:
        return jsonify({"data": ""}), 204
    
    return jsonify({
        "data": {
            "status": request["status"],
            "requesterId": request["requester_id"],
            "timestamp": request["timestamp"]
        }
    }), 200

@accounts.get("/users/<username1>/friends/<username2>")
def get_friendship_status_between_usernames(username1: str, username2: str):
    user1: User | None = db.session.execute(
        db.select(User).filter_by(username = username1)
    ).scalar_one_or_none()
    
    user2: User | None = db.session.execute(
        db.select(User).filter_by(username = username2)
    ).scalar_one_or_none()
    
    if not user1 and not user2:
        return jsonify({"error": f"Users @{username1} and @{username2} not found."}), 404
    elif not user1:
        return jsonify({"error": f"User @{username1} not found."}), 404
    elif not user2:
        return jsonify({"error": f"User @{username2} not found."}), 404
    
    return get_friendship_status_between_user_ids(user1.id, user2.id)

@accounts.get("/users/friends/<int:user_id>")
@login_required
def get_friendship_status_with_user_id(user_id: int):
    return get_friendship_status_between_user_ids(current_user.id, user_id)

@accounts.get("/users/friends/@<username>")
@login_required
def get_friendship_status_with_username(username: str):
    return get_friendship_status_between_usernames(current_user.username, username)