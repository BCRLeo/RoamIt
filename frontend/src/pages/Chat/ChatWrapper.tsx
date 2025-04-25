import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import useUserContext from '../../features/auth/hooks/useUserContext';
import ChatList from './ChatList';
import ChatPage from './ChatPage';

export default function ChatWrapper() {
    const { chatId } = useParams<{ chatId: string }>();
    const { user } = useUserContext();
    console.log('ChatWrapper user:', user);

    if (!user) {
        return <Typography>Loading user...</Typography>;
    }

    return (
        <Box display = "flex" height = "100vh">
            <Box
                width = { 320 }
                bgcolor = "#121212"
                borderRight = {1}
                borderColor = "divider"
                sx = {{ overflowY: 'auto' }}
            >
                <ChatList />
            </Box>

            <Box flex = { 1 } sx = {{ overflowY: 'auto', backgroundColor: '#101010' }}>
                { chatId ? (
                    <ChatPage userId = { user.id } chatId = { parseInt(chatId) } />
                ) : (
                    <Box p = { 4 }>
                        <Typography variant = "h6" color = "text.secondary">
                            Select a conversation to start chatting
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};