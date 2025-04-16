from babel.numbers import get_territory_currencies
from datetime import date, datetime
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

from ..models import Listing, Location
from ..extensions import db

listings = Blueprint("listings", __name__)

@listings.route("/listings", methods = ["POST"])
@login_required
def create_listing():
    data = request.get_json(silent = True)
    
    if not data:
        return jsonify({"error": "Missing listing data."}), 400
    
    category: str = data.get("category")
    location_name: str | None = data.get("location_name")
    latitude: float = data.get("latitude")
    longitude: float = data.get("longitude")
    start_date_string: str = data.get("start_date")
    end_date_string: str | None = data.get("end_date")
    dates_are_approximate: bool | None = data.get("dates_are_approximate")
    nightly_budget: int | None = data.get("nightly_budget")
    description: str | None = data.get("description")
    prefers_same_gender: bool | None = data.get("prefers_same_gender")
    
    if not (category and latitude and longitude and start_date_string):
        return jsonify({"error": "Missing listing data."}), 400
    
    if not category in ["short", "long", "hosting"]:
        return jsonify({"error": "Invalid listing category."}), 400
    
    if abs(latitude) > 90 or abs(longitude) > 180:
        return jsonify({"error": "Invalid coordinates."}), 400
    
    try:
        start_date = datetime.strptime(start_date_string, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_string, "%Y-%m-%d").date() if end_date_string else None
    except ValueError:
        return jsonify({"error": "Invalid date format."}), 400
    
    if start_date < date.today():
        return jsonify({"error": "Start date must be in the future."}), 400
    
    if end_date and end_date <= start_date:
        return jsonify({"error": "End date must be after start date."}), 400
    
    if nightly_budget and nightly_budget < 0:
        return jsonify({"error": "Budget must be non-negative."}), 400
    
    location: Location | None = db.session.execute(
        db.select(Location)
        .filter_by(name = location_name)
        .filter_by(latitude = latitude)
        .filter_by(longitude = longitude)
    ).scalars().first()
    
    if not location:
        location = Location(latitude, longitude, location_name)
    
    if not location.country:
        return jsonify({"error": "Invalid location."}), 400
    
    currency = get_territory_currencies(location.country)[0]
    
    listing = Listing(
        user_id = current_user.id,
        category = category,
        start_date = start_date,
        end_date = end_date,
        dates_are_approximate = dates_are_approximate,
        nightly_budget = nightly_budget,
        currency = currency,
        description = description,
        prefers_same_gender = prefers_same_gender
    )
    
    location.listings.append(listing)
    
    try:
        db.session.add(listing)
        db.session.commit()
        
        return "", 204
    except Exception as error:
        print("Error creating listing:", error)
        db.session.rollback()
        
        return jsonify({"error": error}), 500

@listings.route("/listings/<int:listing_id>", methods = ["GET"])
def get_listing(listing_id: int):
    listing: Listing | None = db.session.execute(db.select(Listing).filter_by(id = listing_id)).scalar_one_or_none()
    
    if not listing:
        return jsonify({"error": f"Listing #{listing_id} not found."}), 404
    
    return jsonify({"data": listing.to_dict(for_javascript = True)}), 200

@listings.route("/listings", methods = ["GET"])
@login_required
def get_listings():
    listings: list[Listing] = current_user.listings.all()
    listing_data = [listing.to_dict(for_javascript = True) for listing in listings]
    
    return jsonify({"data": listing_data}), 200

@listings.route("/listings/<int:listing_id>", methods = ["DELETE"])
@login_required
def delete_listing(listing_id: int):
    listing: Listing | None = db.session.execute(db.select(Listing).filter_by(id = listing_id)).scalar_one_or_none()
    
    if not listing:
        return jsonify({"error": f"Listing #{listing_id} not found."}), 404
    
    try:
        db.session.delete(listing)
        db.session.commit()
        
        return "", 204
    except Exception as error:
        print(f"Error deleting listing #{listing_id}:", error)
        db.session.rollback()
        
        return jsonify({"error": error}), 500