import React, { useEffect, useState } from 'react';
import {
    List,
    ListItemText,
    Typography,
    Divider,
    ListItemButton,
    Button,
    Box,
    AvatarGroup,
    useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useUserContext from '../../features/auth/hooks/useUserContext';
import { createChat, getChats } from '../../features/chats/chatsApi';
import { ChatData } from '../../features/chats/chatsConstants';
import ProfilePicture from '../../features/accounts/components/ProfilePicture';
import NotFoundPage from '../NotFound/NotFoundPage';

export default function ChatList({ collapsed = false }: { collapsed?: boolean }) {
    const [chats, setChats] = useState<ChatData[]>([]);
    const { user } = useUserContext();
    const navigate = useNavigate();
    const theme = useTheme();

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
        const response = await createChat([user.id, 3, 5]);
        if (response !== null) {
            navigate(`/chats/${response}`);
            fetchChats();
        }
    }

    if (!user) {
        return (
            <NotFoundPage />
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                backgroundColor: theme.palette.background.default,
            }}
        >
            {!collapsed && (
                <Button
                    variant="contained"
                    fullWidth
                    sx={{ my: 1 }}
                    onClick={handleCreateChat}
                >
                    + New Chat
                </Button>
            )}

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <List>
                    {chats.length === 0 ? (
                        <Typography padding={2} color={theme.palette.text.secondary}>
                            You have no chats yet.
                        </Typography>
                    ) : (
                        chats.map((chat) => (
                            <React.Fragment key={chat.id}>
                                <ListItemButton
                                    onClick={() => navigate(`/chats/${chat.id}`)}
                                    alignItems="flex-start"
                                    sx={{ py: 1.5, px: collapsed ? 1 : 2 }}
                                >
                                    { chat.isGroup ? (
                                        <AvatarGroup max = { 3 } sx = {{ mr: collapsed ? 0 : 2 }}>
                                            {chat.memberProfiles?.map((user) => (
                                                <ProfilePicture userId = { user.id } />
                                            ))}
                                        </AvatarGroup>
                                    ) : (
                                        <ProfilePicture userId = { user.id } />
                                    )}

                                    {!collapsed && (
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
                                                        sx={{ mb: 0.5, color: theme.palette.text.secondary }}
                                                        noWrap
                                                    >
                                                        {chat.latestMessage || 'No messages yet'}
                                                    </Typography>
                                                    {chat.latestTime && (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{ color: theme.palette.text.secondary }}
                                                        >
                                                            {new Date(chat.latestTime).toLocaleTimeString()}
                                                        </Typography>
                                                    )}
                                                </>
                                            }
                                        />
                                    )}
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
