from babel.numbers import get_territory_currencies
from datetime import date, datetime
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from werkzeug.datastructures import FileStorage

from ..extensions import db
from ..models import Listing, ListingPicture, Location
from ..utilities import can_convert_to_float, can_convert_to_int, string_to_bool

listings = Blueprint("listings", __name__)

@listings.route("/listings", methods = ["POST"])
@login_required
def create_listing():
    form = request.form
    
    if not form:
        return jsonify({"error": "Missing listing data."}), 400
    
    location_name = form.get("location_name") # optional
    latitude = form.get("latitude")
    longitude = form.get("longitude")
    radius = form.get("radius")
    category = form.get("category")
    nightly_budget = form.get("nightly_budget") # optional
    start_date = form.get("start_date")
    end_date = form.get("end_date") # optional
    dates_are_approximate = form.get("dates_are_approximate")
    prefers_same_gender = form.get("prefers_same_gender")
    description = form.get("description")
    images: list[FileStorage] = request.files.getlist("images") if "images" in request.files else [] # optional
    
    if not all([latitude, longitude, radius, category, start_date, dates_are_approximate, prefers_same_gender, description]):
        return jsonify({"error": "Missing listing data."}), 400
    
    if not can_convert_to_float(latitude) or not can_convert_to_float(longitude):
        return jsonify({"error": "Invalid coordinates"}), 400
    latitude = float(latitude)
    longitude = float(longitude)
    if abs(latitude) > 90 or abs(longitude) > 180:
        return jsonify({"error": "Invalid coordinates."}), 400
    
    if not can_convert_to_int(radius):
        return jsonify({"error": "Invalid radius."}), 400
    radius = int(radius)
    if radius <= 0:
        return jsonify({"error": "Radius must be positive."}), 400
    
    if not category in ["short-term", "long-term", "hosting"]:
        return jsonify({"error": "Invalid listing category."}), 400
    
    if nightly_budget:
        if not can_convert_to_int(nightly_budget):
            return jsonify({"error": "Invalid nightly budget."}), 400
        nightly_budget = int(nightly_budget)
        if nightly_budget <= 0:
            return jsonify({"error": "Budget must be non-negative."}), 400
    
    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else None
    except ValueError:
        return jsonify({"error": "Invalid date format."}), 400
    if start_date < date.today():
        return jsonify({"error": "Start date must be in the future."}), 400
    if end_date and end_date <= start_date:
        return jsonify({"error": "End date must be after start date."}), 400
    
    dates_are_approximate = string_to_bool(dates_are_approximate)
    
    prefers_same_gender = string_to_bool(prefers_same_gender)
    
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
        prefers_same_gender = prefers_same_gender,
        radius = radius
    )
    
    location.listings.append(listing)
    
    try:
        db.session.add(listing)
        db.session.commit()
    except Exception as error:
        print("Error creating listing:", error)
        db.session.rollback()
        
        return jsonify({"error": str(error)}), 500
    
    unsaved_images: list[str] = []
    
    for image in images:
        try:
            file_data = image.read()
            file_type = image.content_type
            
            if not file_type.startswith('image/'):
                return jsonify({"error": "Invalid file type."}), 400

            if len(file_data) > 5 * 1024 * 1024:  # 5MB limit
                return jsonify({"error": "Image too large."}), 400
            
            listing_picture = ListingPicture(listing_id = listing.id, image_data = file_data, image_mimetype = file_type)
            db.session.add(listing_picture)
            db.session.commit()
        except Exception as error:
            db.session.rollback()
            print(f"Error uploading listing image {image.filename}:", error)
            unsaved_images.append(image.filename)
    
    if unsaved_images:
        return jsonify({
            "data": {
                "message": "Listing created, but some images failed to upload.",
                "id": listing.id,
                "unsavedImages": unsaved_images
            }
        }), 207
    
    return jsonify({
        "data": listing.id
    }), 201

@listings.route("/listings/<int:listing_id>", methods = ["GET"])
def get_listing(listing_id: int):
    listing: Listing | None = db.session.execute(
        db.select(Listing)
        .filter_by(id = listing_id)
    ).scalar_one_or_none()
    
    if not listing:
        return jsonify({"error": f"Listing #{listing_id} not found."}), 404
    
    return jsonify({"data": listing.to_dict(for_javascript = True)}), 200

@listings.route("/listings", methods = ["GET"])
@login_required
def get_listings():
    listings: list[Listing] = current_user.listings.all()
    
    if not listings:
        return jsonify({"data": ""}), 204
    
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
        
        return jsonify({"error": str(error)}), 500