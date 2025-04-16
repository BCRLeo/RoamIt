import React from 'react';
import { Box, TextField, Button } from '@mui/material';

interface MessageInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ value, onChange, onSend }) => {
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

export default MessageInput;
