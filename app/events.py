from .extensions import socketio, db, login_manager, migrate
from flask_socketio import emit, join_room, leave_room
from flask import request, session
from flask_login import current_user
from .models import Message

@socketio.on('connect')
def handle_connect():
    print("[SOCKET] CONNECT")
    print("Session contents:", dict(session))
    print("current_user.is_authenticated:", current_user.is_authenticated)
    emit("auth_check", {"authenticated": current_user.is_authenticated, "user_id": current_user.get_id()})

@socketio.on('join')
def handle_join(data):
    discussion_id = data.get('discussion_id')

    if not discussion_id:
        emit('error', {'msg': 'Missing discussion ID'})
        return

    room = f"discussion_{discussion_id}"
    join_room(room)
    print(f"[join] User {current_user.id if current_user.is_authenticated else 'anonymous'} joined room: {room}")
    emit('status', {'msg': f'User joined discussion {discussion_id}'}, room=room)


@socketio.on('send_message')
def handle_send_message(data):
    print("[send_message] Received:", data)
    if not current_user.is_authenticated:
        emit('error', {'msg': 'User not authenticated'})
        print("[send_message] Blocked: unauthenticated user")
        return
    sender_id = current_user.id
    discussion_id = data.get('discussion_id')
    content = data.get('content')
    file_url = data.get('file_url')

    if not discussion_id or not content:
        emit('error', {'msg': 'Missing discussion ID or message content'})
        print("[send_message] Blocked: missing fields")
        return

    room = f"discussion_{discussion_id}"
    msg = Message(
        sender_id=sender_id,
        discussion_id=discussion_id,
        content=content,
        file_url=file_url
    )
    db.session.add(msg)
    db.session.commit()

    print("[send_message] Saved message to DB:", msg.to_dict())
    print("[send_message] Broadcasting message to room:", room)
    emit('receive_message', msg.to_dict(), room=room)


@socketio.on('react_message')
def handle_react_message(data):
    sender_id = data.get('sender_id')
    message_id = data.get('message_id')
    discussion_title = data.get('discussion_title')
    reaction_type = data.get('reaction_type')

    if not sender_id or not message_id or not discussion_title or not reaction_type:
        emit('error', {'msg': 'Missing sender ID, message ID, discussion title, or reaction type'})
        return

    msg = Message.query.get(message_id)
    if not msg:
        emit('error', {'msg': 'Message not found'})
        return

    user = current_user
    msg.react(user, reaction_type)
    room = discussion_title
    print(f"[react_message] User {user.id} reacted with '{reaction_type}' to message {msg.id} in {room}")
    emit('reaction_updated', {'message_id': msg.id, 'reaction_type': reaction_type}, room=room)


@socketio.on('unreact_message')
def handle_unreact_message(data):
    sender_id = data.get('sender_id')
    message_id = data.get('message_id')
    discussion_title = data.get('discussion_title')

    if not sender_id or not message_id or not discussion_title:
        emit('error', {'msg': 'Missing sender ID, message ID, or discussion title'})
        return

    msg = Message.query.get(message_id)
    if not msg:
        emit('error', {'msg': 'Message not found'})
        return

    user = current_user
    msg.unreact(user)
    room = discussion_title
    print(f"[unreact_message] User {user.id} removed reaction from message {msg.id} in {room}")
    emit('reaction_removed', {'message_id': msg.id}, room=room)