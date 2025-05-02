import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { getCurrentUser } from '../../../features/auth/authApi';
import { getChatMessages } from '../../../features/chats/chatsApi';
import { MessageData } from '../../../features/chats/chatsConstants';

const socket = io('http://127.0.0.1:5005', {
  autoConnect: false,
  transports: ['polling','websocket'],
});

export function useChatPage(userId: number, chatId: number) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);


  // 1) load history + setup socket
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const history = await getChatMessages(chatId);
      if (!cancelled && history) setMessages(history);
    }

    async function setup() {
      const user = await getCurrentUser();
      if (!user) return;
      if (!socket.connected) socket.connect();
      socket.emit('join', { chat_id: chatId });

      socket.off('receive_message')
            .on('receive_message', (msg: MessageData) => {
              setMessages(prev => [...prev, msg]);
            });
    }

    load();
    setup();

    return () => {
      cancelled = true;
      socket.emit('leave', { chat_id: chatId });
      socket.off('receive_message');
    };
  }, [chatId, userId]);

  // 2) auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3) send handler
  const handleSend = () => {
    const content = newMessage.trim();
    if (!content) return;

    socket.emit('send_message', {
      chat_id: chatId,
      content,
      sender_id: userId,
    });
    setNewMessage('');
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    bottomRef,
    handleSend,
  };
}
