import { useState, useRef } from 'react';
import { Box, Typography, Paper, useTheme, CircularProgress } from '@mui/material';
import MessageList from '../../features/chats/components/MessageList';
import MessageInput from '../../features/chats/components/MessageInput';
import { MessageData } from '../../features/chats/chatsConstants';
import { useChatInfo, useChatMessages, useChatSocket, useAutoScroll } from '../../features/chats/hooks/useChatPage';

interface ChatPageProps {
    userId: number;
    chatId: number;
}

export default function ChatPage({ userId, chatId }: ChatPageProps) {
    const { chatInfo, loading: loadingInfo } = useChatInfo(chatId);
    const { messages, setMessages, loading: loadingMsgs } = useChatMessages(chatId);
    const [newMessage, setNewMessage] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

   
    useChatSocket(chatId, (msg: MessageData) => setMessages(prev => [...prev, msg]));

  
    useAutoScroll(bottomRef, [messages]);

  
    const handleSend = () => {
        if (!newMessage.trim()) return;
        setNewMessage("");
    };

   
    let headerText = 'Loading...';
    if (!loadingInfo && chatInfo) {
        if (chatInfo.isGroup) headerText = chatInfo.title || 'Unnamed Group';
        else {
            const other = chatInfo.members.find(m => m.id !== userId);
            headerText = other?.username || 'Unknown Chat';
        }
    }

    return (
        <Box p={2} display="flex" flexDirection="column" flex={1} minHeight={0} sx={{ backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h5" gutterBottom>{headerText}</Typography>
            <Paper variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: theme.palette.background.default }}>
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {loadingMsgs ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <MessageList messages={messages} userId={userId} bottomRef={bottomRef} />
                    )}
                    <div ref={bottomRef} />
                </Box>
            </Paper>
            <MessageInput value={newMessage} onChange={setNewMessage} onSend={handleSend} />
        </Box>
    );
}
