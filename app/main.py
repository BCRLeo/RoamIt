from flask import Flask, Blueprint, current_app, render_template, redirect, request, url_for, jsonify, send_file
from flask_login import LoginManager, login_required, current_user
import io
import json
import os
from .extensions import db
from . import models
from werkzeug.utils import secure_filename
from json import dumps

main = Blueprint('main', __name__)
#redirect users trying to get to unaccessible pages
login_manager = LoginManager()
login_manager.login_view = 'auth.login'

# Catch-all route to serve index.html for any other route
@main.route('/', defaults={'path': ''})
@main.route('/<path:path>')
def serve_react_app(path):
    return render_template("index.html")