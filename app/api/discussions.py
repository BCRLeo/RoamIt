# chat.py or routes.py
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from ..models import Message, Discussion, User
from .. import db

chat = Blueprint('chat', __name__)

@chat.route('/discussions/<int:discussion_id>/messages')
@login_required
def get_messages(discussion_id):
    messages = Message.query.filter_by(discussion_id=discussion_id).order_by(Message.timestamp).all()
    return jsonify({
        "data": [msg.to_dict() for msg in messages]
    }), 200

@chat.route("/discussions", methods=["GET"])
@login_required
def get_user_discussions():
    discussions = current_user.discussions.order_by(Discussion.created_at.desc()).all()
    result = []

    for d in discussions:
        latest = d.messages.order_by(Message.timestamp.desc()).first()

        # Get member info
        members = [
            {
                "id": u.id,
                "username": u.username,
                "profilePicUrl": f"/api/users/{u.id}/profile-picture"
            } for u in d.members
        ]

        # Get other user (for private chats only)
        other_user = next((u for u in members if u["id"] != current_user.id), None)

        result.append({
            "id": d.id,
            "isGroup": d.is_group,
            "title": d.title,
            "memberIds": [u["id"] for u in members],
            "creationDate": d.created_at,
            "latestMessage": latest.content if latest else "",
            "latestTime": latest.timestamp.isoformat() if latest else None,
            "memberProfiles": members if d.is_group else None,
            "otherUser": other_user if not d.is_group else None,
        })

    return jsonify({"data": result}), 200


@chat.route("/discussions/<int:discussion_id>")
@login_required
def get_discussion_detail(discussion_id):
    discussion = Discussion.query.get_or_404(discussion_id)

    if current_user not in discussion.members:
        return jsonify({"error": "Not a member"}), 403

    members = [
        {
            "id": u.id,
            "username": u.username,
            "profilePicUrl": f"/api/users/{u.id}/profile-picture"
        } for u in discussion.members
    ]

    other_user = next((u for u in members if u["id"] != current_user.id), None)

    return jsonify({
        "id": discussion.id,
        "isGroup": discussion.is_group,
        "title": discussion.title,
        "memberIds": [u["id"] for u in members],
        "createdAt": discussion.created_at.isoformat(),
        "memberProfiles": members if discussion.is_group else None,
        "otherUser": other_user if not discussion.is_group else None
    })

@chat.route("/discussions", methods=["POST"])
@login_required
def create_discussion():
    data = request.get_json()
    member_ids = data.get("member_ids")  # must include self
    title = data.get("title")            # optional (for group chat)
    is_group = data.get("is_group", False)

    if not member_ids:
        return jsonify({"error": "Invalid members"}), 400
    
    if current_user.id not in member_ids:
        member_ids.append(current_user.id)

    members = User.query.filter(User.id.in_(member_ids)).all()
    discussion = Discussion(title=title, is_group=is_group)
    discussion.members.extend(members)

    try:
        db.session.add(discussion)
        db.session.commit()
        
        return jsonify({"data": discussion.id}), 201
    except Exception as error:
        db.session.rollback()
        
        return jsonify({"error": error}), 500