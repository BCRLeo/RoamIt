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

const ChatList: React.FC = () => {
    const [discussions, setDiscussions] = useState<ChatData[]>([]);
    const { user } = useUserContext();
    const navigate = useNavigate();

    async function fetchDiscussions() {
        const response = await getChats();

        if (response) {
            setDiscussions(response);
        }
    }

    useEffect(() => {
        fetchDiscussions();
    }, []);

    const getDisplayTitle = (d: ChatData) => {
        if (d.isGroup) return d.title || 'Unnamed group';
        const otherId = d.memberIds.find((id) => id !== user?.id);
        return `Chat with user #${otherId}`;
    };

    async function handleCreateDiscussion() {
        if (!user) {
            return;
        }

        const response = await createChat([user.id, 3]); // TODO: add user selection...

        if (response !== null) {
            navigate(`/chats/${ response }`);
            fetchDiscussions();
        }
    };

    return (
        <Box>
            <Button
                variant="contained"
                fullWidth
                sx={{ my: 1 }}
                onClick={handleCreateDiscussion}
            >
                + New Chat
            </Button>

            <List sx={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
                {discussions.length === 0 ? (
                    <Typography p={2} color="text.secondary">
                        You have no conversations yet.
                    </Typography>
                ) : (
                    discussions.map((d) => (
                        <React.Fragment key={d.id}>
                            <ListItemButton
                                onClick={() => navigate(`/chat/${d.id}`)}
                                alignItems="flex-start"
                                sx={{ py: 1.5, px: 2 }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {getDisplayTitle(d)}
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
                                                {d.latestMessage || 'No messages yet'}
                                            </Typography>
                                            {d.latestTime && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    { d.latestTime ? new Date(d.latestTime).toLocaleTimeString() : undefined}
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
    );
};

export default ChatList;