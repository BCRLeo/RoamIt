from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from ..models import User
from ..extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user, current_user
import os
import re
from datetime import datetime, date

auth = Blueprint('auth', __name__)
# Regular expression for basic email and password validation
EMAIL_REGEX = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
PASSWORD_REGEX = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&-]{8,}$"

@auth.route("/session", methods = ["GET"])
def get_user():
    if current_user.is_authenticated:
        return jsonify({
            "data": {
                "firstName": current_user.first_name,
                "lastName": current_user.last_name,
                "username": current_user.username,
                "email": current_user.email
                }
            }), 200
    
    return jsonify({"error": "User not authenticated."}), 401

@auth.route("/session", methods = ["POST"])
def log_in():
    data = request.get_json(True)
    login = data.get('login')
    password = data.get('password')
    
    if not login and not password:
        return jsonify({"error": "Missing username/email and password."}), 400
    if not login:
        return jsonify({"error": "Missing username/email."}), 400
    if not password:
        return jsonify({"error": "Missing password."}), 400
    
    if re.match(EMAIL_REGEX, login):
        user = User.query.filter_by(email = login).first()
        login_type = "email"
    else:
        user = User.query.filter_by(username = login).first()
        login_type = "username"
    
    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify({
            "data": {
                "firstName": current_user.first_name,
                "lastName": current_user.last_name,
                "username": user.username,
                "email": user.email
                }
            }), 200
    
    return jsonify({"error": f"Invalid {login_type} or password."}), 400

@auth.route("/session", methods = ["DELETE"])
def log_out():
    if current_user.is_authenticated:
        logout_user()
        return "", 200
    return jsonify({"error": "User not authenticated."}), 401

@auth.route("/user", methods = ["POST"])
def sign_up():
    data = request.get_json()
    email = data.get("email")
    username = data.get("username")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    password = data.get("password")
    birthday_str = data.get("birthday")
    gender = data.get("gender")
    
    # Validate email format
    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Invalid email format."}), 400
    
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
            "firstName": current_user.first_name,
            "lastName": current_user.last_name,
            "username": username,
            "email": email
        }
        }), 200