from .extensions import socketio, db, login_manager, migrate
from flask_socketio import emit, join_room, leave_room
from flask_login import current_user
from .models import Message


@socketio.on('join')
def handle_join(data):
    discussion_id = data.get('discussion_id')
    discussion_title = data.get('discussion_title')
    
    if not discussion_id or not discussion_title:
        emit('error', {'msg': 'Missing discussion ID or title'})
        return

    room = discussion_title
    join_room(room)
    emit('status', {'msg': f'User joined discussion: {discussion_title}'}, room=room)

@socketio.on('send_message')
def handle_send_message(data):
    sender_id = data.get('sender_id')
    discussion_id = data.get('discussion_id')
    discussion_title = data.get('discussion_title')
    content = data.get('content')
    file_url = data.get('file_url')  # Optional file URL for message attachment

    if not sender_id or not discussion_id or not discussion_title or not content:
        emit('error', {'msg': 'Missing sender ID, discussion details, or message content'})
        return

    room = discussion_title
    msg = Message(
        sender_id=sender_id, 
        discussion_id=discussion_id, 
        content=content, 
        file_url=file_url
    )
    db.session.add(msg)
    db.session.commit()

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

    # Use current_user if available; alternatively, you could fetch the user via sender_id.
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
