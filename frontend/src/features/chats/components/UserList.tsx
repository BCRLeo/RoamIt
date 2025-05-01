import {
    List,
    ListItemButton,
    ListItemIcon,
    Checkbox,
    ListItemText,
    Box,
    CircularProgress,
    Typography,
} from '@mui/material';
import ProfilePicture from './../../../features/accounts/components/ProfilePicture';
import { ChatUser } from '../../../features/chats/chatsConstants';

interface UserListProps {
    users: ChatUser[];
    selectedIds: number[];
    toggleUser: (id: number) => void;
    loading: boolean;
}

export default function UserList({ users, selectedIds, toggleUser, loading }: UserListProps) {
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
            </Box>
        );
    }
    if (users.length === 0) {
        return <Typography color="text.secondary">No users found.</Typography>;
    }
    return (
        <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {users.map(u => (
                <ListItemButton
                    key={u.id}
                    onClick={() => toggleUser(u.id)}
                    selected={selectedIds.includes(u.id)}
                >
                    <ListItemIcon>
                        <Checkbox edge="start" checked={selectedIds.includes(u.id)} tabIndex={-1} />
                    </ListItemIcon>
                    <ProfilePicture userId={u.id} size="sm" />
                    <ListItemText primary={u.username} sx={{ ml: 1 }} />
                </ListItemButton>
            ))}
        </List>
    );
}