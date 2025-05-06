import { ListItem, ListItemText, Typography, useTheme, Avatar} from '@mui/material';
import { MessageData } from '../chatsConstants';

export default function Message({
    message,
    isOwn = false,
}: {
    message: MessageData;
    isOwn?: boolean;
}) {
    const theme = useTheme();

    return (
        <ListItem
            alignItems="flex-start"
            sx={{
                display: 'flex',
                flexDirection: isOwn ? 'row-reverse' : 'row',
                justifyContent: 'flex-start',
            }}
        >
            {!isOwn && (
                <Avatar
                    src={message.senderProfilePicUrl}
                    alt={message.senderUsername}
                    sx={{ width: 36, height: 36, mr: 2 }}
                />
            )}
            <ListItemText
                sx={{
                    maxWidth: '70%',
                    backgroundColor: isOwn
                    ? theme.palette.primary.main
                    : theme.palette.action.hover,
                    p: '1rem',
                    borderRadius: 1,
                    color: isOwn
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                }}

                primary={
                    <>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                        >
                            {message.senderUsername}
                        </Typography>
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography variant="caption">
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </Typography>
                    </>
                }
            />
        </ListItem>
    );
}
