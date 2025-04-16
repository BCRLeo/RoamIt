import React from 'react';
import { List, ListItem, ListItemText, Typography, Divider } from '@mui/material';

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
  messages: Message[];
  userId: number;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

const MessageList: React.FC<Props> = ({ messages, userId, bottomRef }) => {
  return (
    <List sx={{ height: '100%', overflowY: 'auto' }}>
      {messages.map((msg) => (
        <React.Fragment key={msg.id}>
          <ListItem
            alignItems="flex-start"
            sx={{ justifyContent: msg.sender_id === userId ? 'flex-end' : 'flex-start' }}
          >
            <ListItemText
              sx={{
                maxWidth: '70%',
                backgroundColor: msg.sender_id === userId ? '#023020' : '#5A5A5A',
                p: 1.5,
                borderRadius: 2,
              }}
              primary={
                <>
                  <Typography variant="body1">{msg.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                </>
              }
            />
          </ListItem>
          <Divider component="li" />
        </React.Fragment>
      ))}
      <div ref={bottomRef} />
    </List>
  );
};

export default MessageList;
