import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import useUserContext from "../../features/auth/hooks/useUserContext";
import { getCurrentUser } from '../../features/auth/authApi';

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


function ChatPage({ userId, discussionId }: { userId: number, discussionId: number }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        (async () => {
            const user = await getCurrentUser();

            if (user) {
                socket.connect(); // only connect after session is valid
                socket.emit('join', { discussion_id: discussionId });
            }
        })();

        const handleReceiveMessage = (msg: Message) => {
            console.log('[Socket] received message:', msg);
            setMessages((prev) => [...prev, msg]);
        };

        const handleAuthCheck = (data: any) => {
            console.log('[AUTH CHECK]', data);
        };

        socket.on('connect', () => {
            console.log('[Socket] connected:', socket.id);
        });

        socket.on('receive_message', handleReceiveMessage);
        socket.on('auth_check', handleAuthCheck); // ✅ ADD THIS LINE

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('auth_check', handleAuthCheck); // ✅ CLEANUP
        };
    }, [discussionId]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        socket.emit('send_message', {
            discussion_id: discussionId,
            content: newMessage,
            sender_id: userId,
        });
        setNewMessage('');
    };

    return (
        <Box p={2} maxWidth={600} mx="auto">
            <Typography variant="h5" gutterBottom>
                Discussion #{discussionId}
            </Typography>

            <Paper variant="outlined" sx={{ height: 400, overflowY: 'auto', mb: 2 }}>
                <List>
                    {messages.map((msg) => (
                        <React.Fragment key={msg.id}>
                            <ListItem alignItems="flex-start" sx={{ justifyContent: msg.sender_id === userId ? 'flex-end' : 'flex-start' }}>
                                <ListItemText
                                    sx={{
                                        maxWidth: '70%',
                                        backgroundColor: msg.sender_id === userId ? '#e0f7fa' : '#f1f1f1',
                                        p: 1.5,
                                        borderRadius: 2,
                                    }}
                                    primary={
                                        <>
                                            <Typography variant="body1">{msg.content}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            <Box display="flex" gap={1}>
                <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') handleSendMessage();
                    }}
                />
                <Button variant="contained" onClick={handleSendMessage}>
                    Send
                </Button>
            </Box>
        </Box>
    );
}

function ChatWrapper() {
    const { discussionId } = useParams<{ discussionId: string }>();
    const { user } = useUserContext();

    if (!discussionId) return <Typography>Invalid discussion ID</Typography>;
    if (!user || typeof user.userId !== 'number') return <Typography>Loading user...</Typography>;

    return <ChatPage userId={user.userId} discussionId={parseInt(discussionId)} />;
};

export default ChatWrapper;