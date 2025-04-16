import React, { useEffect, useState } from 'react';
import {
  List,
  ListItemText,
  Typography,
  Divider,
  ListItemButton,
  Button,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useUserContext from '../../features/auth/hooks/useUserContext';

interface DiscussionPreview {
  id: number;
  title: string | null;
  is_group: boolean;
  member_ids: number[];
  latest_message: string;
  latest_time: string;
}

const ChatList: React.FC = () => {
  const [discussions, setDiscussions] = useState<DiscussionPreview[]>([]);
  const { user } = useUserContext();
  const navigate = useNavigate();

  const fetchDiscussions = async () => {
    try {
      console.log('[ChatList] Fetching discussions...');
      const res = await fetch('/api/discussions', {
        credentials: 'include',
      });
      const data = await res.json();
      console.log('[ChatList] Discussions received:', data);
      setDiscussions(data);
    } catch (err) {
      console.error('[ChatList] Failed to load discussions', err);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const getDisplayTitle = (d: DiscussionPreview) => {
    if (d.is_group) return d.title || 'Unnamed group';
    const otherId = d.member_ids.find((id) => id !== user?.userId);
    return `Chat with user #${otherId}`;
  };

  const handleCreateDiscussion = async () => {
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          member_ids: [user?.userId, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // change to a valid user
          title: 'Groupchat with users 1 to 10',
          is_group: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to create discussion');
      const data = await res.json();
      console.log('[ChatList] Discussion created:', data);
      navigate(`/chat/${data.id}`);
      fetchDiscussions();
    } catch (err) {
      console.error('[ChatList] Error creating discussion:', err);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        fullWidth
        sx={{ my: 1 }}
        onClick={handleCreateDiscussion}
      >
        + New Chat
      </Button>

      <List sx={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
        {discussions.length === 0 ? (
          <Typography p={2} color="text.secondary">
            You have no conversations yet.
          </Typography>
        ) : (
          discussions.map((d) => (
            <React.Fragment key={d.id}>
              <ListItemButton
                onClick={() => navigate(`/chat/${d.id}`)}
                alignItems="flex-start"
                sx={{ py: 1.5, px: 2 }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight="bold">
                      {getDisplayTitle(d)}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ mb: 0.5 }}
                      >
                        {d.latest_message || 'No messages yet'}
                      </Typography>
                      {d.latest_time && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {new Date(d.latest_time).toLocaleTimeString()}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItemButton>
              <Divider component="li" />
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );
};

export default ChatList;