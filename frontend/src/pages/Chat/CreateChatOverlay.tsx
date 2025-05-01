// src/pages/Chat/CreateChatOverlay.tsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';
import OverlayActions from '../../features/chats/components/OverlayActions';
import SearchUsers from '../../features/chats/components/SearchUsers';
import UserList from '../../features/chats/components/UserList';
import GroupNameInput from '../../features/chats/components/GroupNameInput';
import { useCreateChatOverlay } from '../../features/chats/hooks/useCreateChatOverlay';

interface CreateChatOverlayProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (chatId: number) => void;
}

export default function CreateChatOverlay({ open, onClose, onCreated }: CreateChatOverlayProps) {
    const {
        filteredUsers,
        selectedIds,
        toggleUser,
        searchTerm,
        setSearchTerm,
        groupName,
        setGroupName,
        loadingUsers,
        loadingAction,
        existingChatId,
        handleCreate,
    } = useCreateChatOverlay(open, onClose, onCreated);

    if (!open) return null;

    const needsGroupName = selectedIds.length > 1;
    const actionLabel = loadingAction
        ? null
        : existingChatId
            ? 'Open Chat'
            : 'Create';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                New Chat
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <SearchUsers
                    value={searchTerm}
                    onChange={setSearchTerm}
                    disabled={loadingUsers}
                />
                <UserList
                    users={filteredUsers}
                    selectedIds={selectedIds}
                    toggleUser={toggleUser}
                    loading={loadingUsers}
                />
                {needsGroupName && (
                    <GroupNameInput
                        value={groupName}
                        onChange={setGroupName}
                    />
                )}
            </DialogContent>
            <OverlayActions
                onClose={onClose}
                onCreate={handleCreate}
                disabled={
                    loadingAction ||
                    selectedIds.length === 0 ||
                    (needsGroupName && !groupName.trim())
                }
                loading={loadingAction}
                label={actionLabel!}
            />
        </Dialog>
    );
}