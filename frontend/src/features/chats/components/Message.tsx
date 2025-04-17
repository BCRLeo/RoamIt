import { ListItem, ListItemText, Typography, useTheme } from '@mui/material';
import { MessageData } from '../chatsConstants';

export default function Message({ message, isOwn = false }: { message: MessageData, isOwn?: boolean }) {
    const theme = useTheme();

    return (
        <ListItem alignItems="flex-start" sx={{ justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
            <ListItemText
                sx={{
                    maxWidth: '70%',
                    backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.message.main,
                    p: "1rem",
                    borderRadius: theme.shape.borderRadius,
                }}
                primary={
                    <>
                        <Typography variant="body1" color = { theme.palette.primary.contrastText }>
                            {message.content}
                        </Typography>
                        <Typography variant="caption" color = { theme.palette.primary.contrastText }>
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </Typography>
                    </>
                }
            />
        </ListItem>
    );
};