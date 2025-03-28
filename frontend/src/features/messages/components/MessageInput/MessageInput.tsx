import React from 'react';
import { List, Box, TextField, Button } from '@mui/material';
import MessageItem from '../MessageItem/MessageItem';

interface Message {
    id: number;
    sender_id: number;
    discussion_id: number;
    content: string;
    file_url?: string;
    seen: boolean;
    timestamp: string;
  }  

interface MessageListProps {
  messages: Message[];
  userId: number;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, userId }) => {
  return (
    <List sx={{ height: 400, overflowY: 'auto' }}>
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} isOwn={msg.sender_id === userId} />
      ))}
    </List>
  );
};

interface MessageInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ value, onChange, onSend }) => {
  return (
    <Box display="flex" gap={1} mt={2}>
      <TextField
        fullWidth
        placeholder="Type your message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSend();
        }}
      />
      <Button variant="contained" onClick={onSend}>
        Send
      </Button>
    </Box>
  );
};
