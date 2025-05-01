from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user

from .. import db
from ..models import Message, Discussion, User

chats = Blueprint("chats", __name__)

@chats.route("/chats", methods=["POST"])
@login_required
def create_chat():
    data = request.get_json(silent = True)
    
    if not data:
        return jsonify({"error": "Missing chat data."}), 400
    
    member_ids: list | None = data.get("member_ids")
    title: str | None = data.get("title")

    if not member_ids:
        return jsonify({"error": "Missing chat members."}), 400
    
    if not all(isinstance(id, int) for id in member_ids):
        return jsonify({"error": "Invalid member ID(s)."}), 400
    
    if current_user.id not in member_ids:
        member_ids.append(current_user.id)
    
    is_group = len(member_ids) > 1
    members = db.session.execute(
        db.select(User)
        .where(User.id.in_(member_ids))
    ).scalars().all()
    
    if abs(len(members) - len(member_ids)) == 1:
        return jsonify({"error": "Invalid chat member."}), 400
    elif abs(len(members) - len(member_ids)) > 1:
        return jsonify({"error": "Invalid chat members."}), 400
    
    chat = Discussion(title = title, is_group = is_group)
    chat.members.extend(members)

    try:
        db.session.add(chat)
        db.session.commit()
        
        return jsonify({"data": chat.id}), 201
    except Exception as error:
        db.session.rollback()
        
        return jsonify({"error": error}), 500

@chats.route("/chats", methods=["GET"])
@login_required
def get_user_chats():
    chats: list[Discussion] = current_user.discussions.order_by(Discussion.created_at.desc()).all()
    result = []
    
    for chat in chats:
        latest: Message | None = chat.messages.order_by(Message.timestamp.desc()).first()
        result.append({
            "id": chat.id,
            "isGroup": chat.is_group,
            "title": chat.title,
            "memberIds": [user.id for user in chat.members],
            "creationDate": chat.created_at,
            "latestMessage": latest.content if latest else None,
            "latestTime": latest.timestamp.isoformat() if latest else None
        })
    
    return jsonify({"data": result}), 200


@chats.route("/chats/<int:chat_id>")
@login_required
def get_chat_data(chat_id):
    chat: Discussion | None = db.session.execute(
        db.select(Discussion)
        .filter_by(id = chat_id)
    ).scalar_one_or_none()
    
    latest: Message | None = chat.messages.order_by(Message.timestamp.desc()).first()
    
    if not chat:
        return jsonify({"error": f"Chat ${chat_id} not found."}), 404

    if current_user not in chat.members:
        return jsonify({"error": f"User not a member of chat #{chat_id}."}), 403

    return jsonify({
        "id": chat.id,
        "isGroup": chat.is_group,
        "title": chat.title,
        "memberIds": [user.id for user in chat.members],
        "createdAt": chat.created_at.isoformat(),
        "latestMessage": latest.content if latest else None,
        "latestTime": latest.timestamp.isoformat() if latest else None
    }), 200

@chats.route("/chats/<int:chat_id>/messages", methods = ["GET"])
@login_required
def get_chat_messages(chat_id):
    messages: list[Message] = db.session.execute(
        db.select(Message)
        .filter_by(discussion_id = chat_id)
        .order_by(Message.timestamp)
    ).scalars().all()
    
    return jsonify({
        "data": [message.to_dict() for message in messages]
    }), 200