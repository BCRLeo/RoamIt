import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import useUserContext from '../../features/auth/hooks/useUserContext';
import ChatList from './ChatList';
import { ChatPage } from './ChatPage';

const ChatWrapper = () => {
    const { discussionId } = useParams<{ discussionId: string }>();
    const { user } = useUserContext();

    if (!user) {
        return <Typography>Loading user...</Typography>;
    }

    return (
        <Box display="flex" height="100vh">
            {/* Sidebar */}
            <Box
                width={320}
                bgcolor="#121212"
                borderRight={1}
                borderColor="divider"
                sx={{ overflowY: 'auto' }}
            >
                <ChatList />
            </Box>

            {/* Chat content */}
            <Box flex={1} sx={{ overflowY: 'auto', backgroundColor: '#101010' }}>
                {discussionId ? (
                    <ChatPage userId={user.id} discussionId={parseInt(discussionId)} />
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
};

export default ChatWrapper;
