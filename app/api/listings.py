from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from ..models import User
from ..extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user, current_user
import os
import re
from datetime import datetime, date

listings = Blueprint("listings", __name__)

@listings.route("/listing", methods = ["GET"])
def get_listings():
    if current_user.is_authenticated:
        listing_ids = current_user.get_listing_ids()
        completions = [current_user.listings.filter_by(id = listing_id).first().trip_completed for listing_id in listing_ids]

        return jsonify({
            "data": {
                "listingIds" : listing_ids,
                "isCompleted" : completions
            }
        }), 200
    