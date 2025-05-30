import re
from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import check_password_hash
from ..extensions import db
from ..models import User
from .accounts import EMAIL_REGEX

auth = Blueprint('auth', __name__)
# Regular expression for basic email and password validation

@auth.route("/sessions", methods = ["GET"])
@login_required
def get_current_user():
    return jsonify({
        "data": {
            "id": current_user.id,
            "firstName": current_user.first_name,
            "lastName": current_user.last_name,
            "username": current_user.username,
            "email": current_user.email
            }
        }), 200

@auth.route("/sessions", methods = ["POST"])
def log_in():
    data = request.get_json(silent = True)
    login = data.get('login')
    password = data.get('password')
    
    if not login and not password:
        return jsonify({"error": "Missing username/email and password."}), 400
    if not login:
        return jsonify({"error": "Missing username/email."}), 400
    if not password:
        return jsonify({"error": "Missing password."}), 400
    
    if re.match(EMAIL_REGEX, login):
        user = db.session.execute(db.select(User).filter_by(email = login)).scalar_one_or_none()
        login_type = "email"
    else:
        user = db.session.execute(db.select(User).filter_by(username = login)).scalar_one_or_none()
        login_type = "username"
    
    if user and check_password_hash(user.password, password):
        login_user(user)
        
        return jsonify({
            "data": {
                "id": current_user.id,
                "firstName": current_user.first_name,
                "lastName": current_user.last_name,
                "username": user.username,
                "email": user.email
                }
            }), 201
    
    return jsonify({"error": f"Invalid {login_type} or password."}), 400

@auth.route("/sessions", methods = ["DELETE"])
@login_required
def log_out():
    logout_user()
    return "", 204