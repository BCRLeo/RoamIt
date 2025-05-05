from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from sqlalchemy import func, or_

from .. import db
from ..models import Message, Chat, User, Match
from ..utilities import can_convert_to_int

chats = Blueprint("chats", __name__)

@chats.route("/chats", methods=["POST"])
@login_required
def create_chat():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Missing chat data."}), 400

    member_ids = data.get("member_ids")
    title = data.get("title")
    if not member_ids or not isinstance(member_ids, list):
        return jsonify({"error": "Missing or invalid chat members."}), 400

    # Ensure current user is included
    if current_user.id not in member_ids:
        member_ids.append(current_user.id)

    # Validate IDs are ints
    if not all(isinstance(i, int) for i in member_ids):
        return jsonify({"error": "Invalid member ID(s)."}), 400

    # Fetch users and validate existence
    members = db.session.execute(
        db.select(User).where(User.id.in_(member_ids))
    ).scalars().all()
    if len(members) != len(set(member_ids)):
        return jsonify({"error": "One or more member IDs are invalid."}), 400

    is_group = len(member_ids) > 2
    chat = Chat(title=title, is_group=is_group)
    chat.members.extend(members)

    try:
        db.session.add(chat)
        db.session.commit()
        return jsonify({"data": chat.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@chats.get("/chats")
@login_required
def get_chats():
    """
    Return all chats current_user belongs to.
    """
    member_id_strings = request.args.getlist("member_ids")
    member_ids = [int(id) for id in member_id_strings if can_convert_to_int(id)]
    
    if current_user.id in member_ids and len(member_ids) == 1:
        member_ids = []
    
    if current_user.id not in member_ids and member_ids:
        member_ids += current_user.id
    
    if len(member_id_strings) - len(member_ids) > 1:
        return jsonify({"error": "Invalid member ids."}), 400
    elif len(member_id_strings) - len(member_id_strings) == 1:
        return jsonify({"error": "Invalid member id."}), 400
    
    if member_ids:
        chats: list[Chat] = db.session.execute(
            db.select(Chat)
            .filter(
                Chat.members.any(id = current_user.id),
                *[Chat.members.any(id = member_id) for member_id in member_ids]
            )
        ).scalars().all()
        
        for chat in chats:
            if {member.id for member in chat.members} == set(member_ids):
                return jsonify({"data": chat.to_dict(True)}), 200
                
        return jsonify({"error": f"Chat with member ids {member_ids} not found."}), 404
    else:
        chats: list[Chat] = db.session.execute(
            db.select(Chat)
            .join(Chat.members)
            .filter(User.id == current_user.id)
        ).scalars().all()

        results = [chat.to_dict(True) for chat in chats]
    
    if not results:
        return "", 204
    
    return jsonify({"data": results}), 200

@chats.route("/chats/<int:chat_id>", methods=["GET"])
@login_required
def get_chat_data(chat_id):
    chat = db.session.get(Chat, chat_id)
    if not chat:
        return jsonify({"error": "Chat not found."}), 404
    if current_user not in chat.members:
        return jsonify({"error": "Forbidden."}), 403

    latest = (
        chat.messages
        .order_by(Message.timestamp.desc())
        .first()
    )
    return jsonify({
        "id": chat.id,
        "isGroup": chat.is_group,
        "title": chat.title,
        "members": [
            {"id": u.id, "username": u.username, "profilePicUrl": f"/api/users/{u.id}/profile-picture"}
            for u in chat.members
        ],
        "latestMessage": latest.content if latest else None,
        "latestTime": latest.timestamp.isoformat() if latest else None
    }), 200

@chats.route("/chats/<int:chat_id>", methods=["DELETE"])
@login_required
def delete_chat(chat_id):
    chat = db.session.get(Chat, chat_id)
    if not chat:
        return jsonify({"error": "Chat not found."}), 404
    if current_user not in chat.members:
        return jsonify({"error": "Forbidden."}), 403

    try:
        db.session.delete(chat)
        db.session.commit()
        return jsonify({"data": "deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@chats.route("/chats/<int:chat_id>/messages", methods=["GET"])
@login_required
def get_chat_messages(chat_id):
    messages = (
        db.session
        .query(Message)
        .filter_by(chat_id=chat_id)
        .order_by(Message.timestamp)
        .all()
    )
    return jsonify({"data": [m.to_dict() for m in messages]}), 200

@chats.route("/chat-matches", methods=["GET"])
@login_required
def get_chat_matches():
    """
    Returns a list of users the current user has matched with (via listings),
    suitable for chat creation UI.
    """
    try:
        listing_ids = current_user.get_listing_ids()
        if not listing_ids:
            return jsonify({"data": []}), 200

        matches = db.session.execute(
            db.select(Match).filter(
                or_(
                    Match.listing1_id.in_(listing_ids),
                    Match.listing2_id.in_(listing_ids)
                )
            )
        ).scalars().all()

        matched_user_ids = set()
        for match in matches:
            if match.listing1.user_id != current_user.id:
                matched_user_ids.add(match.listing1.user_id)
            if match.listing2.user_id != current_user.id:
                matched_user_ids.add(match.listing2.user_id)

        if not matched_user_ids:
            return jsonify({"data": []}), 200

        matched_users = db.session.execute(
            db.select(User).filter(User.id.in_(matched_user_ids))
        ).scalars().all()

        return jsonify({
            "data": [
                {
                    "userId": user.id,
                    "username": user.username,
                    "profilePicUrl": f"/api/users/{user.id}/profile-picture"
                }
                for user in matched_users
            ]
        }), 200

    except Exception as error:
        print("Error retrieving chat matches:", error)
        return jsonify({"error": "Failed to retrieve chat matches."}), 500

