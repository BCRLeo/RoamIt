from .extensions import socketio, db
from flask_socketio import emit, join_room
from flask import session
from flask_login import current_user
from .models import Message, Discussion, User

@socketio.on('connect')
def handle_connect():
    emit("auth_check", {"authenticated": current_user.is_authenticated, "user_id": current_user.get_id()})

@socketio.on('join')
def handle_join(data):
    
    discussion_id = data.get('discussion_id')
    discussion = Discussion.query.get(discussion_id)

    if not discussion or current_user not in discussion.members:
        emit('error', {'msg': 'Invalid or unauthorized discussion'})
        return

    room = f"discussion_{discussion_id}"
    join_room(room)
    emit('status', {'msg': f'User joined discussion {discussion_id}'}, room=room)
    print(f"[join] current_user: {current_user}")
    print(f"[join] discussion_id: {discussion_id}")
    print(f"[join] user is in discussion.members? {current_user in discussion.members}")


@socketio.on('send_message')
def handle_send_message(data):
    discussion_id = data.get('discussion_id')
    discussion = Discussion.query.get(discussion_id)

    if not discussion or current_user not in discussion.members:
        emit('error', {'msg': 'Invalid or unauthorized discussion'})
        return

    content = data.get('content')
    file_url = data.get('file_url')

    if not content:
        emit('error', {'msg': 'Message content is required'})
        return

    msg = Message(
        sender_id=current_user.id,
        discussion_id=discussion_id,
        content=content,
        file_url=file_url
    )

    db.session.add(msg)
    db.session.commit()

    print(f'[send_message] Message saved: {msg.id}')
    print(f"[send_message] emitting to discussion_{discussion_id}")
    emit('receive_message', msg.to_dict(), room=f'discussion_{discussion_id}')



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
    emit('reaction_removed', {'message_id': msg.id}, room=room)