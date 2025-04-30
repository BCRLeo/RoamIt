import React, { useEffect, useState } from 'react';
import {
    List,
    ListItemText,
    Typography,
    Divider,
    ListItemButton,
    Button,
    Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useUserContext from '../../features/auth/hooks/useUserContext';
import { createChat, getChats } from '../../features/chats/chatsApi';
import { ChatData } from '../../features/chats/chatsConstants';

export default function ChatList() {
    const [chats, setChats] = useState<ChatData[]>([]);
    const { user } = useUserContext();
    const navigate = useNavigate();

    async function fetchChats() {
        const response = await getChats();

        if (response) {
            setChats(response);
        }
    }

    useEffect(() => {
        fetchChats();
    }, []);

    function getDisplayTitle(chat: ChatData) {
        if (chat.isGroup) return chat.title || 'Unnamed group';
        const otherId = chat.memberIds.find((id) => id !== user?.id);
        return `Chat with user #${otherId}`;
    }

    async function handleCreateChat() {
        if (!user) return;

        const response = await createChat([user.id, 3, 5]); // TODO: add user selection...

        if (response !== null) {
            navigate(`/chats/${response}`);
            fetchChats();
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
            }}
        >
            <Button
                variant="contained"
                fullWidth
                sx={{ my: 1 }}
                onClick={handleCreateChat}
            >
                + New Chat
            </Button>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <List>
                    {chats.length === 0 ? (
                        <Typography padding={2} color="text.secondary">
                            You have no chats yet.
                        </Typography>
                    ) : (
                        chats.map((chat) => (
                            <React.Fragment key={chat.id}>
                                <ListItemButton
                                    onClick={() => navigate(`/chats/${chat.id}`)}
                                    alignItems="flex-start"
                                    sx={{ py: 1.5, px: 2 }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {getDisplayTitle(chat)}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    noWrap
                                                    sx={{ mb: 0.5 }}
                                                >
                                                    {chat.latestMessage || 'No messages yet'}
                                                </Typography>
                                                {chat.latestTime && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(chat.latestTime).toLocaleTimeString()}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                </ListItemButton>
                                <Divider component="li" />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Box>
        </Box>
    );
}
