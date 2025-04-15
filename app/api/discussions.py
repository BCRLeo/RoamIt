# chat.py or routes.py
from flask import Blueprint, jsonify
from flask_login import login_required
from ..models import Message

chat = Blueprint('chat', __name__)

@chat.route('/discussions/<int:discussion_id>/messages')
@login_required
def get_messages(discussion_id):
    from flask_login import current_user
    print("il culo è a posto")
    messages = Message.query.filter_by(discussion_id=discussion_id).order_by(Message.timestamp).all()
    return jsonify([msg.to_dict() for msg in messages])
