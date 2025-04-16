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
    return jsonify([msg.to_dict() for msg in messages])

@chat.route("/discussions", methods=["GET"])
@login_required
def get_user_discussions():
    discussions = current_user.discussions.order_by(Discussion.created_at.desc()).all()
    result = []
    for d in discussions:
        latest = d.messages.order_by(Message.timestamp.desc()).first()
        result.append({
            "id": d.id,
            "is_group": d.is_group,
            "title": d.title,
            "member_ids": [u.id for u in d.members],
            "latest_message": latest.content if latest else "",
            "latest_time": latest.timestamp.isoformat() if latest else None,
        })
    return jsonify(result)

@chat.route("/discussions/<int:discussion_id>")
@login_required
def get_discussion_detail(discussion_id):
    discussion = Discussion.query.get_or_404(discussion_id)

    if current_user not in discussion.members:
        return jsonify({"error": "Not a member"}), 403

    return jsonify({
        "id": discussion.id,
        "is_group": discussion.is_group,
        "title": discussion.title,
        "member_ids": [u.id for u in discussion.members],
        "created_at": discussion.created_at.isoformat()
    })

@chat.route("/discussions", methods=["POST"])
@login_required
def create_discussion():
    data = request.get_json()
    member_ids = data.get("member_ids")  # must include self
    title = data.get("title")            # optional (for group chat)
    is_group = data.get("is_group", False)

    if not member_ids or current_user.id not in member_ids:
        return jsonify({"error": "Invalid members"}), 400

    members = User.query.filter(User.id.in_(member_ids)).all()
    discussion = Discussion(title=title, is_group=is_group)
    discussion.members.extend(members)

    db.session.add(discussion)
    db.session.commit()
    return jsonify({"id": discussion.id}), 201
