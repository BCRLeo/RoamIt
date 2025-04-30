// ChatWrapper.tsx
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import useUserContext from '../../features/auth/hooks/useUserContext';
import ChatList from './ChatList';
import ChatPage from './ChatPage';

export default function ChatWrapper() {
    const { chatId } = useParams<{ chatId: string }>();
    const { user } = useUserContext();

    if (!user) {
        return <Typography>Loading user...</Typography>;
    }

    return (
        <Box display="flex" height="100%" minHeight={0}>
            {/* LEFT PANEL — scrollable */}
            <Box
                width={320}
                bgcolor="#121212"
                borderRight={1}
                borderColor="divider"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    minHeight: 0,
                }}
            >
                <ChatList />
            </Box>

            {/* RIGHT PANEL — fills space */}
            <Box
                flex={1}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: '#101010',
                    minHeight: 0,
                }}
            >
                {chatId ? (
                    <ChatPage userId={user.id} chatId={parseInt(chatId)} />
                ) : (
                    <Box p={4}>
                        <Typography variant="h6" color="text.secondary">
                            Select a conversation to start chatting
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
