import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Box, Typography, Paper } from '@mui/material';
import { getCurrentUser } from '../../features/auth/authApi';
import MessageList from "../../features/messages/components/MessageList/MessageList";
import MessageInput from "../../features/messages/components/MessageInput/MessageInput";

interface Message {
  id: number;
  sender_id: number;
  discussion_id: number;
  content: string;
  file_url?: string;
  seen: boolean;
  timestamp: string;
}

const socket = io('http://127.0.0.1:5005', {
  autoConnect: false,
});

export function ChatPage({ userId, discussionId }: { userId: number; discussionId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/discussions/${discussionId}/messages`, {
          credentials: 'include',
        });
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };

    fetchMessages();

    const setupSocket = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      if (!socket.connected) {
        socket.connect();
      } else {
        socket.emit('join', { discussion_id: discussionId });
      }

      socket.off('receive_message');
      socket.off('auth_check');
      socket.off('connect');

      socket.on('receive_message', (msg: Message) => {
        console.log('[Socket] Message received:', msg);
        if (msg.sender_id !== userId) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      socket.on('auth_check', (data: any) => {
        console.log('[AUTH CHECK]', data);
      });

      socket.on('connect', () => {
        console.log('[Socket] connected:', socket.id);
        socket.emit('join', { discussion_id: discussionId });
      });
    };

    setupSocket();

    return () => {
      socket.off('receive_message');
      socket.off('auth_check');
      socket.off('connect');
    };
  }, [discussionId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const tempMsg = {
      id: Date.now(),
      sender_id: userId,
      discussion_id: discussionId,
      content: newMessage,
      seen: false,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    socket.emit('send_message', {
      discussion_id: discussionId,
      content: newMessage,
      sender_id: userId,
    });

    setNewMessage('');
  };

  return (
    <Box p={2} display="flex" flexDirection="column" height="100%">
      <Typography variant="h5" gutterBottom>
        Discussion #{discussionId}
      </Typography>

      <Paper
        variant="outlined"
        sx={{ flexGrow: 1, overflow: 'hidden', mb: 2, display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <MessageList messages={messages} userId={userId} bottomRef={bottomRef} />
        </Box>
      </Paper>

      <MessageInput
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSendMessage}
      />
    </Box>
  );
}

export default ChatPage;
