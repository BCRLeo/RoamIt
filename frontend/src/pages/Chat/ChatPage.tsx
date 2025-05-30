import { Box, Typography, Paper, useTheme } from '@mui/material';
import MessageList from '../../features/chats/components/MessageList';
import MessageInput from '../../features/chats/components/MessageInput';
import { useChatPage } from '../../features/chats/hooks/useChatPage';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getChatData } from '../../features/chats/chatsApi';
import NotFoundPage from '../NotFound/NotFoundPage';
import Name from '../../features/accounts/components/Name';

interface ChatPageProps {
    userId: number;
    chatId: number;
}

export default function ChatPage({ userId, chatId }: ChatPageProps) {
    const theme = useTheme();
    const {
        messages,
        newMessage,
        setNewMessage,
        bottomRef,
        handleSend,
    } = useChatPage(userId, chatId);

    const { data: chat } = useSuspenseQuery({
        queryKey: ["getChatData", chatId],
        queryFn: async () => await getChatData(chatId)
    });

    if (!chat) return (
        <NotFoundPage />
    );

    const memberIds = Array.from(chat.members, (member) => member.id);

    return (
        <Box
            p={2}
            display="flex"
            flexDirection="column"
            flex={1}
            minHeight={0}
            sx={{ backgroundColor: theme.palette.background.paper }}
        >
            <Typography variant="h5" gutterBottom>
                { chat.title ?? (chat.isGroup ?
                    `Group with ${ memberIds.length } others`
                :
                    <Name userId = { memberIds[(memberIds.indexOf(userId) + 1) % 2] } />
                )}
            </Typography>

            <Paper
                variant="outlined"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {messages.length === 0 ? (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                        >
                            <Typography color="text.secondary">
                                No messages yet.
                            </Typography>
                        </Box>
                    ) : (
                        <MessageList
                            messages={messages}
                            userId={userId}
                            bottomRef={bottomRef}
                        />
                    )}
                    <div ref={bottomRef} />
                </Box>
            </Paper>

            <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={handleSend}
            />
        </Box>
    );
}
