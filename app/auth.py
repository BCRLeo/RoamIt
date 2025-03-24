# app/auth.py

from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from .models import User
from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user, current_user
import os
import re
from datetime import datetime, date

auth = Blueprint('auth', __name__)
# Regular expression for basic email and password validation
EMAIL_REGEX = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
PASSWORD_REGEX = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&-]{8,}$"

@auth.route('/api/check-login', methods=['GET'])
def check_login():
    if current_user.is_authenticated:
        return jsonify({
            "success": True,
            "user": {
                "isLoggedIn": True,
                "username": current_user.UserName,
                "email": current_user.email
            }
            }), 200
    return jsonify({
        "success": False,
        "user": {
            "isLoggedIn": False
        }
        })

@auth.route('/api/login', methods=['POST'])
def login():
    if request.method == 'POST':
        # Get form data
        data = request.get_json()
        login_input = data.get("login")  # Could be username or email
        password = data.get("password")
        
        # Check if login_input and password are provided
        if not login_input or not password:
            return jsonify({"success": False, "message": "Please enter both login and password"}), 400
        
        # Check if the input is an email
        if re.match(EMAIL_REGEX, login_input):  # Checks if the input is a valid email
            user = User.query.filter_by(email=login_input).first()
        else:
            user = User.query.filter_by(UserName=login_input).first()

        # Authenticate user
        if user and check_password_hash(user.password, password):
            login_user(user)
            return jsonify({
                "success": True,
                "user": {
                    "username": user.UserName,
                    "email": user.email
                },
                "message": "Login successful"
                }), 200
        else:
            return jsonify({"success": False, "message": "Invalid username/email or password"}), 401
            
    return jsonify({"success": False, "message": "Invalid request method"}), 405

@auth.route("/api/signup", methods=["POST"])
def signup():
    # Get form data
    data = request.get_json()
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    birthday_str = data.get("birthday")
    # Validate email format
    if not re.match(EMAIL_REGEX, email):
        return jsonify({"success": False, "message": "Invalid email format"})
        
    # Validate password format using regex
    if not re.match(PASSWORD_REGEX, password):
        return jsonify({"success": False, "message": "Password must be at least 8 characters long, contain at least one uppercase letter, and one number"})
    
    # Convert the string 'YYYY-MM-DD' to a Python date object
    try:
        birthday = datetime.strptime(birthday_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"success": False, "message": "Invalid date format"})
    
    # Check if user exists
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({"success": False, "message": "Email address already in use"})
    
    # Create new user and wardrobe
    new_user = User(
        email=email,
        UserName=username,
        password=generate_password_hash(password, method='pbkdf2:sha256'),
        birthday = birthday,
        CreationDate = date.today()
    )
    
    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)

    return jsonify({
        "success": True,
        "user": {
            "username": username,
            "email": email
        },
        "message": "User successfully registered"})

@auth.route('/api/logout', methods=["GET"])
def logout():
    if current_user.is_authenticated:
        logout_user()
        return jsonify({"success": True, "message": "User successfully logged out"}), 200
    return jsonify({"success": False, "message": "User not originally logged in"}), 401
