from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from geodistpy import geodist
from sqlalchemy import or_

from ..algorithm import listing_recommendations
from ..extensions import db
from ..models import Listing, Location, Swipe, Match
from ..utilities import CustomHTTPError

matches = Blueprint("matches", __name__)

@login_required
def get_feasible_listing_recommendations(listing_id: int):
    self_listing: Listing = db.session.execute(
        db.select(Listing)
        .filter_by(id = listing_id)
    ).scalar_one_or_none()
    
    if not self_listing:
        raise CustomHTTPError(f"Listing #{listing_id} not found.", 404)
    
    if self_listing.user_id != current_user.id:
        raise CustomHTTPError(f"Listing #{listing_id} does not belong to user.", 403)
    
    locations: list[Location] = self_listing.location.get_locations_within_radius(self_listing.radius * 1000) # convert km to m
    listings: list[Listing] = []
    
    for location in locations:
        listings += location.listings
    
    listings = list(filter(
        lambda listing: (
            listing.id != self_listing.id and
            geodist((self_listing.location.latitude, self_listing.location.longitude), (listing.location.latitude, listing.location.longitude), "km") <= listing.radius
        ), listings))
    
    return listings

@matches.get("/listings/<int:listing_id>/recommendations")
@login_required
def get_listing_recommendations(listing_id: int):
    listing: Listing = db.session.execute(
        db.select(Listing)
        .filter_by(id = listing_id)
    ).scalar_one_or_none()
    
    if not listing:
        return jsonify({"error": f"Listing #{listing_id} not found."}), 404
    
    if listing.user_id != current_user.id:
        return jsonify({"error": f"Listing #{listing_id} does not belong to user."}), 403
    
    try:
        listing_ids = listing_recommendations(listing_id)
    except CustomHTTPError as error:
        return jsonify({"error": str(error)}), error.status_code
    
    if not listing_ids:
        return "", 204
    
    return jsonify({"data": listing_ids}), 200

@matches.post("/listings/<int:listing_id>/swipes")
@login_required
def swipe_listing(listing_id: int):
    listing: Listing | None = db.session.get(Listing, listing_id)
    
    if not listing:
        return jsonify({"error": f"Listing #{listing_id} not found."}), 404
    
    if listing.user_id != current_user.id:
        return jsonify({"error": f"Listing #{listing_id} does not belong to user."}), 403
    
    data = request.get_json(silent = True)
    
    if not data:
        return jsonify({"error": "Missing swipe data."}), 400
    
    target_listing_id: int | None = data.get("target_listing_id")
    is_like: bool | None = data.get("is_like")
        
    if target_listing_id is None or is_like is None:
        return jsonify({"error": "Missing swipe data."}), 400
    
    if listing_id == target_listing_id:
        return jsonify({"error": "Cannot swipe on own listing."}), 400
    
    
    target: Listing | None = db.session.get(Listing, target_listing_id)
    
    if not target:
        return jsonify({"error": f"Listing #{target_listing_id} not found."}), 404
    
    try:
        swipe = Swipe.create_swipe(listing, target, is_like)
        
        if not swipe:
            return jsonify({"error": f"Identical swipe on listing #{target_listing_id} already exists."}), 400
    except Exception as error:
        db.session.rollback()
        print(f"Failed to swipe on listing #{target_listing_id}:", str(error))
        
        return jsonify({"error": str(error)}), 500
    
    if is_like:
        listing1_id, listing2_id = sorted([listing_id, target_listing_id])
        match: Match | None = db.session.execute(
            db.select(Match)
            .filter_by(listing1_id = listing1_id, listing2_id = listing2_id)
        ).scalar_one_or_none()
    
        if match:
            return jsonify({"data": match.to_dict()}), 201
        
    return "", 204

@matches.get("/swipes")
@login_required
def get_swipes():
    listing_ids = current_user.get_listing_ids()
    
    if not listing_ids:
        return "", 204
    
    direction = request.args.get("direction")
    
    outgoing_swipes: list[Swipe] | None = db.session.execute(
        db.select(Swipe).filter(
            Swipe.swiped_by_listing_id.in_(listing_ids)
        )
    ).scalars().all()
    incoming_swipes: list[Swipe] | None = db.session.execute(
        db.select(Swipe).filter(
            Swipe.swiped_on_listing_id.in_(listing_ids)
        )
    ).scalars().all()
    
    if not (outgoing_swipes or incoming_swipes):
        return "", 204
    
    if direction == "outgoing":
        if outgoing_swipes:
            return jsonify({"data": [swipe.to_dict() for swipe in outgoing_swipes]})
    elif direction == "incoming":
        if incoming_swipes:
            return jsonify({"data": [swipe.to_dict() for swipe in incoming_swipes]})
    else:
        return jsonify({"data": {
            "outgoing": [swipe.to_dict() for swipe in outgoing_swipes] if outgoing_swipes else [],
            "incoming": [swipe.to_dict() for swipe in incoming_swipes] if incoming_swipes else []
        }}), 200
    
    return "", 204

@matches.delete("/swipes/<int:swipe_id>")
@login_required
def delete_swipe(swipe_id: int):
    swipe: Swipe | None = db.session.get(Swipe, swipe_id)
    
    if not swipe:
        return jsonify({"error": f"Swipe #{swipe_id} not found."}), 404
    
    if swipe.swiped_by_listing.user_id != current_user.id:
        return jsonify({"error": f"Swipe #{swipe_id} does not belong to user."}), 403
    
    try:
        db.session.delete(swipe)
        db.session.commit()
        
        return "", 204
    except Exception as error:
        db.session.rollback()
        print(f"Failed to delete swipe #{swipe_id}:", error)
        
        return jsonify({"error": str(error)}), 500

# TODO: add get_swipes_by_listing_id

@matches.get("/matches")
@login_required
def get_matches():
    listing_ids: list[int] = current_user.get_listing_ids()
    
    if not listing_ids:
        return "", 204
    
    matches: list[Match] | None = db.session.execute(
        db.select(Match).filter(
            or_(Match.listing1_id.in_(listing_ids),
                Match.listing2_id.in_(listing_ids))
        )
    ).scalars().all()
    
    if not matches:
        return "", 204
    
    return jsonify({"data": [match.to_dict() for match in matches]}), 200

@matches.get("/matches/<int:match_id>")
@login_required
def get_match(match_id: int):
    match: Match | None = db.session.get(Match, match_id)
    
    if not match:
        return jsonify({"error": f"Match #{match_id} not found."}), 404
    
    if current_user.id not in (match.listing1.user_id, match.listing2.user_id):
        return jsonify({"error": f"Match #{match_id} does not belong to user."}), 403
    
    return jsonify({"data": match.to_dict()}), 200

@matches.get("/listings/<int:listing_id>/matches")
@login_required
def get_matches_by_listing_id(listing_id: int):
    listing: Listing | None = db.session.get(Listing, listing_id)
    
    if not Listing:
        return jsonify({"error": f"Listing #{listing_id} not found."}), 404
    
    if listing.user_id != current_user.id:
        return jsonify({"error": f"Listing #{listing_id} does not belong to user."}), 403
    
    matches: list[Match] | None = db.session.execute(
        db.select(Match).filter(
            or_(Match.listing1_id == listing_id,
                Match.listing2_id == listing_id)
        )
    ).scalars().all()
    
    if not matches:
        return "", 204
    
    return jsonify({"data": [match.to_dict() for match in matches]}), 200

@matches.delete("/matches/<int:match_id>")
@login_required
def delete_match(match_id: int):
    match: Match | None = db.session.get(Match, match_id)
    
    if not match:
        return jsonify({"error": f"Match #{match_id} not found."}), 404
    
    if current_user.id not in (match.listing1.user_id, match.listing2.user_id):
        return jsonify({"error": f"Match #{match_id} does not belong to user."}), 403
    
    try:
        db.session.delete(match)
        db.session.commit()
        
        return "", 204
    except Exception as error:
        db.session.rollback()
        print(f"Failed to delete match #{match_id}:", error)
        
        return jsonify({"error": str(error)}), 500