from .extensions import socketio, db, login_manager, migrate
from flask_socketio import emit, join_room, leave_room
from flask_login import current_user
from .models import Message

def get_room_name(user1_id, user2_id):
    return f"room_{min(user1_id, user2_id)}_{max(user1_id, user2_id)}"

@socketio.on('join')
def handle_join(data):
    sender_id = data.get('sender_id')
    recipient_id = data.get('recipient_id')

    if not sender_id or not recipient_id:
        emit('error', {'msg': 'Missing sender or recipient ID'})
        return

    room = get_room_name(sender_id, recipient_id)
    join_room(room)
    emit('status', {'msg': f'User {sender_id} joined room {room}'}, room=room)

@socketio.on('send_message')
def handle_send_message(data):
    sender_id = data.get('sender_id')
    recipient_id = data.get('recipient_id')
    content = data.get('content')

    if not sender_id or not recipient_id or not content:
        emit('error', {'msg': 'Missing message content or user IDs'})
        return

    room = get_room_name(sender_id, recipient_id)

    msg = Message(sender_id=sender_id, recipient_id=recipient_id, content=content)
    db.session.add(msg)
    db.session.commit()

    emit('receive_message', msg.to_dict(), room=room)