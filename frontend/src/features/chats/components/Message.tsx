import { ListItem, ListItemText, Typography, useTheme } from '@mui/material';
import { MessageData } from '../chatsConstants';

export default function Message({ message, isOwn = false }: { message: MessageData, isOwn?: boolean }) {
    const theme = useTheme();

    return (
        <ListItem
            alignItems="flex-start"
            sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
            }}
        >
            <ListItemText
                sx={{
                    maxWidth: '70%',
                    backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.message.main,
                    p: "1rem",
                    borderRadius: theme.shape.borderRadius,
                    color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
                }}
                primary={
                    <>
                        <Typography variant="body1">
                            {message.content}
                        </Typography>
                        <Typography variant="caption">
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </Typography>
                    </>
                }
            />
        </ListItem>
    );
};