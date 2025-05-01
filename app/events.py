from .extensions import socketio, db
from flask_socketio import emit, join_room
from flask_login import current_user
from .models import Message, Chat

@socketio.on('connect')
def handle_connect():
    emit("auth_check", {"authenticated": current_user.is_authenticated, "user_id": current_user.get_id()})

@socketio.on('join')
def handle_join(data):
    chat_id = data.get('chat_id')
    chat = Chat.query.get(chat_id)

    if not chat or current_user not in chat.members:
        emit('error', {'msg': 'Invalid or unauthorized chat.'})
        return

    room = f"chat_{chat_id}"
    join_room(room)
    emit('status', {'msg': f'User joined chat #{chat_id}'}, room=room)
    print(f"[join] current_user: {current_user}")
    print(f"[join] chat_id: {chat_id}")
    print(f"[join] user is in chat.members? {current_user in chat.members}")


@socketio.on('send_message')
def handle_send_message(data):
    chat_id = data.get('chat_id')
    chat = Chat.query.get(chat_id)

    if not chat or current_user not in chat.members:
        emit('error', {'msg': 'Invalid or unauthorized chat'})
        return

    content = data.get('content')
    file_url = data.get('file_url')

    if not content:
        emit('error', {'msg': 'Message content is required'})
        return

    msg = Message(
        sender_id=current_user.id,
        chat_id=chat_id,
        content=content,
        file_url=file_url
    )

    db.session.add(msg)
    db.session.commit()

    print(f'[send_message] Message saved: {msg.id}')
    print(f"[send_message] emitting to chat_{chat_id}")
    emit('receive_message', msg.to_dict(), room=f'chat_{chat_id}', include_self=True)



@socketio.on('react_message')
def handle_react_message(data):
    sender_id = data.get('sender_id')
    message_id = data.get('message_id')
    chat_title = data.get('chat_title')
    reaction_type = data.get('reaction_type')

    if not sender_id or not message_id or not chat_title or not reaction_type:
        emit('error', {'msg': 'Missing sender ID, message ID, chat title, or reaction type'})
        return

    msg = Message.query.get(message_id)
    if not msg:
        emit('error', {'msg': 'Message not found'})
        return

    user = current_user
    msg.react(user, reaction_type)
    room = chat_title
    emit('reaction_updated', {'message_id': msg.id, 'reaction_type': reaction_type}, room=room)


@socketio.on('unreact_message')
def handle_unreact_message(data):
    sender_id = data.get('sender_id')
    message_id = data.get('message_id')
    chat_title = data.get('chat_title')

    if not sender_id or not message_id or not chat_title:
        emit('error', {'msg': 'Missing sender ID, message ID, or chat title'})
        return

    msg = Message.query.get(message_id)
    if not msg:
        emit('error', {'msg': 'Message not found'})
        return

    user = current_user
    msg.unreact(user)
    room = chat_title
    emit('reaction_removed', {'message_id': msg.id}, room=room)