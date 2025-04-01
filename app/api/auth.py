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

@auth.route("/sessions", methods = ["GET"])
def get_current_user():
    if current_user.is_authenticated:
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

@auth.route("/sessions", methods = ["POST"])
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
                "userId": current_user.id,
                "firstName": current_user.first_name,
                "lastName": current_user.last_name,
                "username": user.username,
                "email": user.email
                }
            }), 200
    
    return jsonify({"error": f"Invalid {login_type} or password."}), 400

@auth.route("/sessions", methods = ["DELETE"])
def log_out():
    if current_user.is_authenticated:
        logout_user()
        return "", 200
    return jsonify({"error": "User not authenticated."}), 401