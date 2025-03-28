import React from 'react';
import { List } from '@mui/material';
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

interface Props {
  messages: Message[];
  userId: number;
}

const MessageList: React.FC<Props> = ({ messages, userId }) => {
  return (
    <List sx={{ 
        height: 400, 
        overflowY: 'auto' 
        }}
    >
      {messages.map((msg) => (
    <MessageItem
        key={msg.id}
        message={msg}
        isOwn={msg.sender_id === userId}
    />

    ))}
    </List>
  );
};

export default MessageList;