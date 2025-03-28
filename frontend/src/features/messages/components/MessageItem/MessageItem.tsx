import React from 'react';
import { ListItem, ListItemText, Typography } from '@mui/material';

interface Message {
    id: number;
    sender_id: number;
    discussion_id: number;
    content: string;
    file_url?: string;
    seen: boolean;
    timestamp: string;
  }  

interface Props {
  message: Message;
  isOwn: boolean;
}

const MessageItem: React.FC<Props> = ({ message, isOwn }) => {
  return (
    <ListItem alignItems="flex-start" sx={{ justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
      <ListItemText
        sx={{
          maxWidth: '70%',
          backgroundColor: isOwn ? '#e0f7fa' : '#f1f1f1',
          p: 1.5,
          borderRadius: 2,
        }}
        primary={
          <>
            <Typography variant="body1">{message.content}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(message.timestamp).toLocaleTimeString()}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};

export default MessageItem;
