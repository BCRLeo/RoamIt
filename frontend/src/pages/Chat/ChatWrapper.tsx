import { Box, Typography, useTheme } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import useUserContext from '../../features/auth/hooks/useUserContext';
import ChatList from './ChatList';
import ChatPage from './ChatPage';

export default function ChatWrapper() {
    const { chatId } = useParams<{ chatId: string }>();
    const { user } = useUserContext();
    const theme = useTheme();

    const [leftPanelWidth, setLeftPanelWidth] = useState(320); // initial width in px
    const minWidth = 200;
    const maxWidth = 500;

    function handleMouseDown(e: React.MouseEvent) {
        const startX = e.clientX;
        const startWidth = leftPanelWidth;

        function onMouseMove(e: MouseEvent) {
            const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + (e.clientX - startX)));
            setLeftPanelWidth(newWidth);
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    if (!user) {
        return <Typography>Loading user...</Typography>;
    }

    return (
        <Box display="flex" height="100%" minHeight={0}>
            <Box
                sx={{
                    width: leftPanelWidth,
                    transition: 'width 0.1s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: theme.palette.background.default,
                    borderRight: 1,
                    borderColor: 'divider',
                    height: "85dvh"
                }}
            >
                <ChatList collapsed={leftPanelWidth <= 200} />
            </Box>

            <Box
                onMouseDown={handleMouseDown}
                sx={{
                    width: '6px',
                    cursor: 'col-resize',
                    backgroundColor: 'transparent',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                }}
            />


            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    backgroundColor: theme.palette.background.paper,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    height: "85dvh"
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
