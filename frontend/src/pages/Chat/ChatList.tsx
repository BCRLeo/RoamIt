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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    useTheme,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useUserContext from '../../features/auth/hooks/useUserContext';
import { getChats, deleteChat } from '../../features/chats/chatsApi';
import CreateChatOverlay from './CreateChatOverlay';
import { ChatData } from '../../features/chats/chatsConstants';
import ProfilePicture from '../../features/accounts/components/ProfilePicture';
import NotFoundPage from '../NotFound/NotFoundPage';

export default function ChatList({ collapsed = false }: { collapsed?: boolean }) {
    const [chats, setChats] = useState<ChatData[]>([]);
    const [showCreateOverlay, setShowCreateOverlay] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toDelete, setToDelete] = useState<ChatData | null>(null);
    const { user } = useUserContext();
    const navigate = useNavigate();
    const theme = useTheme();

    const fetchChats = async () => {
        const response = await getChats();
        setChats(response || []);
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const getDisplayTitle = (chat: ChatData) => {
        if (chat.isGroup) return chat.title || 'Unnamed group';
        const otherId = chat.memberIds.find(id => id !== user?.id);
        return `Chat with user #${otherId}`;
    };

    const confirmDelete = (chat: ChatData) => {
        setToDelete(chat);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        await deleteChat(toDelete.id);
        setShowConfirm(false);
        setToDelete(null);
        fetchChats();
    };

    if (!user) return <NotFoundPage />;

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
            
            <Box sx={{ p: 2 }}>
                <Button
                    variant="contained"
                    fullWidth={!collapsed}
                    sx={{ minWidth: collapsed ? '40px' : undefined }}
                    onClick={() => setShowCreateOverlay(true)}
                >
                    {collapsed ? '+' : 'New Chat'}
                </Button>
            </Box>

           
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <List>
                    {chats.length === 0 ? (
                        <Typography padding={2} color={theme.palette.text.secondary}>
                            You have no chats yet.
                        </Typography>
                    ) : (
                        chats.map(chat => (
                            <React.Fragment key={chat.id}>
                                <ListItemButton
                                    onClick={() => navigate(`/chats/${chat.id}`)}
                                    alignItems="flex-start"
                                    sx={{ py: 1.5, px: collapsed ? 1 : 2 }}
                                >
                                    {chat.isGroup ? (
                                        <AvatarGroup max={3} sx={{ mr: collapsed ? 0 : 2 }}>
                                            {chat.memberIds.map(id => (
                                                <ProfilePicture key={id} userId={id} />
                                            ))}
                                        </AvatarGroup>
                                    ) : (
                                        <Box sx={{ mr: collapsed ? 0 : 2 }}>
                                            <ProfilePicture
                                                userId={
                                                    chat.memberIds[0] !== user.id
                                                        ? chat.memberIds[0]
                                                        : chat.memberIds[1]
                                                }
                                            />
                                        </Box>
                                    )}

                                    {!collapsed && (
                                        <ListItemText
                                            primary={getDisplayTitle(chat)}
                                            secondary={chat.latestMessage || 'No messages yet'}
                                        />
                                    )}

                                    
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={e => {
                                            e.stopPropagation();
                                            confirmDelete(chat);
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </ListItemButton>
                                <Divider component="li" />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Box>

      
            <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
                <DialogTitle>Delete Chat</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this chat? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
                    <Button color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>


            <CreateChatOverlay
                open={showCreateOverlay}
                onClose={() => setShowCreateOverlay(false)}
                onCreated={(chatId) => {
                    navigate(`/chats/${chatId}`);
                    fetchChats();
                    setShowCreateOverlay(false);
                }}
            />
        </Box>
    );
}