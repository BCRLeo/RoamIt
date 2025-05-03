from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from geodistpy import geodist

from ..models import Listing, Location, Swipe, Match
from ..extensions import db

matches = Blueprint("matches", __name__)

@matches.get("/listings/<int:listing_id>/recommendations")
@login_required
def get_listing_recommendations(listing_id: int):
    self_listing: Listing = db.session.execute(
        db.select(Listing)
        .filter_by(id = listing_id)
    ).scalar_one_or_none()
    
    if self_listing.user_id != current_user.id:
        return jsonify({"error": "Listing does not belong to user."}), 401
    
    locations: list[Location] = self_listing.location.get_locations_within_radius(self_listing.radius * 1000) # convert km to m
    listings: list[Listing] = []
    
    for location in locations:
        listings += location.listings
    
    listings = list(filter(
        lambda listing: (
            listing.id != self_listing.id and
            geodist((self_listing.location.latitude, self_listing.location.longitude), (listing.location.latitude, listing.location.longitude), "km") <= listing.radius
        ), listings))
    
    if not listings:
        return "", 204
    
    return jsonify({"data": [listing.id for listing in listings]}), 200

