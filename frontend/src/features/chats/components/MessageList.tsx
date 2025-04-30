import React from 'react';
import { List, Divider } from '@mui/material';
import { MessageData } from '../chatsConstants';
import Message from './Message';

interface Props {
    messages: MessageData[];
    userId: number;
    bottomRef: React.RefObject<HTMLDivElement | null>;
}

const MessageList: React.FC<Props> = ({ messages, userId, bottomRef }) => {
    return (
        <List sx={{ height: '100%'}}>
            {messages.map((msg) => {
                console.log('Rendering message:', msg);
                console.log('Current userId:', userId);
                console.log('msg.senderId === userId:', msg.senderId === userId);
                return (
                    <React.Fragment key={msg.id}>
                        <Message message={msg} isOwn={msg.senderId === userId} />
                        <Divider component="li" />
                    </React.Fragment>
                );
            })}
            <div ref={bottomRef} />
        </List>
    );
};

export default MessageList;
