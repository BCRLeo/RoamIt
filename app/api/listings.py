from flask import Blueprint, jsonify
from flask_login import current_user

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
    