from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from sqlalchemy import or_

from ..models import Listing, Swipe, Match
from ..extensions import db

swipes = Blueprint("swipes", __name__)

def _match_to_dict(match: Match) -> dict:
    """Return a JS-friendly dict for a Match instance."""
    return {
        "matchId": match.id,
        "listing1Id": match.listing1_id,
        "listing2Id": match.listing2_id,
        "matchedOn": match.matched_on.isoformat()
    }


@swipes.route("/swipes", methods=["POST"])
@login_required
def create_swipe():
    """
    Body JSON -> {
        "swiped_by_listing_id": int,   # listing doing the swipe (must belong to current_user)
        "swiped_on_listing_id": int,   # listing shown in the card
        "is_right_swipe": bool         # True = like, False = pass
    }

    Commits swipe to db and returns 204 if not reciprocal yet, if it is reciprocal then returns 200
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Missing swipe data."}), 400

    swiped_by_id: int = data.get("swiped_by_listing_id")
    swiped_on_id: int = data.get("swiped_on_listing_id")
    is_right_swipe: bool | None = data.get("is_right_swipe")

    if swiped_by_id is None or swiped_on_id is None or is_right_swipe is None:
        return jsonify({"error": "Missing swipe data."}), 400

    if swiped_by_id == swiped_on_id:
        return jsonify({"error": "Cannot swipe on your own listing."}), 400


    swiped_by: Listing | None = db.session.get(Listing, swiped_by_id)
    swiped_on: Listing | None = db.session.get(Listing, swiped_on_id)
    if not swiped_by or not swiped_on:
        return jsonify({"error": "Listing not found."}), 404

    if swiped_by.user_id != current_user.id:
        return jsonify({"error": "You do not own the swiping listing."}), 403

    try:
        Swipe.swipe(swiped_by, swiped_on, is_right_swipe)
    except Exception as err:
        db.session.rollback()
        print("Error creating swipe:", err)
        return jsonify({"error": "Unable to record swipe."}), 500

    if is_right_swipe:
        d1, d2 = sorted([swiped_by_id, swiped_on_id])
        match: Match | None = db.session.execute(
            db.select(Match).filter_by(listing1_id=d1, listing2_id=d2)
        ).scalar_one_or_none()

        if match:
            return jsonify({"data": _match_to_dict(match)}), 200

    return "", 204



@swipes.route("/matches", methods=["GET"])
@login_required
def get_matches():
    """
    Returns matches across ALL listings, for use in notifications etc
    """
    listing_ids = current_user.get_listing_ids()
    if not listing_ids:
        return jsonify({"data": []}), 200

    matches: list[Match] = db.session.execute(
        db.select(Match).filter(
            or_(Match.listing1_id.in_(listing_ids),
                Match.listing2_id.in_(listing_ids))
        )
    ).scalars().all()

    return jsonify({"data": [_match_to_dict(m) for m in matches]}), 200



@swipes.route("/matches/<int:listing_id>", methods=["GET"])
@login_required
def get_listing_matches(listing_id: int):
    """
    Returns matches for CURRENT listing only
    """
    listing: Listing | None = db.session.get(Listing, listing_id)
    if not listing:
        return jsonify({"error": f"Listing #{listing_id} not found."}), 404
    if listing.user_id != current_user.id:
        return jsonify({"error": "You do not own this listing."}), 403

    matches: list[Match] = db.session.execute(
        db.select(Match).filter(
            or_(Match.listing1_id == listing_id,
                Match.listing2_id == listing_id)
        )
    ).scalars().all()

    return jsonify({"data": [_match_to_dict(m) for m in matches]}), 200
