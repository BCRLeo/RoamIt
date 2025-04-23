import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Box, Typography, Paper } from '@mui/material';
import { getCurrentUser } from '../../features/auth/authApi';
import MessageList from "../../features/chats/components/MessageList";
import MessageInput from "../../features/chats/components/MessageInput";
import { getChatMessages } from '../../features/chats/chatsApi';
import { MessageData } from '../../features/chats/chatsConstants';

const socket = io('http://127.0.0.1:5005', {
    autoConnect: false,
});

export default function ChatPage({ userId, chatId }: { userId: number; chatId: number }) {
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            const response = await getChatMessages(chatId);

            if (response) {
                setMessages(response);
            }
        };

        fetchMessages();

        const setupSocket = async () => {
            const user = await getCurrentUser();
            if (!user) return;

            if (!socket.connected) {
                socket.connect();
            } else {
                socket.emit('join', { discussion_id: chatId });
            }

            socket.off('receive_message');
            socket.off('auth_check');
            socket.off('connect');

            socket.on('receive_message', (msg: MessageData) => {
                console.log('[Socket] Message received:', msg);
                if (msg.senderId !== userId) {
                    setMessages((prev) => [...prev, msg]);
                }
            });

            socket.on('auth_check', (data: any) => {
                console.log('[AUTH CHECK]', data);
            });

            socket.on('connect', () => {
                console.log('[Socket] connected:', socket.id);
                socket.emit('join', { discussion_id: chatId });
            });
        };

        setupSocket();

        return () => {
            socket.off('receive_message');
            socket.off('auth_check');
            socket.off('connect');
        };
    }, [chatId, userId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const tempMsg: MessageData = {
            id: Date.now(),
            senderId: userId,
            chatId: chatId,
            content: newMessage,
            seen: false,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, tempMsg]);

        socket.emit('send_message', {
            discussion_id: chatId,
            content: newMessage,
            sender_id: userId,
        });

        setNewMessage('');
    };

    return (
        <Box p={2} display="flex" flexDirection="column" height="100%">
            <Typography variant="h5" gutterBottom>
                Discussion #{chatId}
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