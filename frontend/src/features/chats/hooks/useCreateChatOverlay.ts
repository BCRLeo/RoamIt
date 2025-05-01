import { useState, useEffect } from 'react';
import { getChatMatches, getChats, createChat } from '../../../features/chats/chatsApi';
import { getFriendList } from '../../../features/accounts/accountsApi';
import useUserContext from '../../../features/auth/hooks/useUserContext';
import { ChatUser } from '../../../features/chats/chatsConstants';


export function useCreateChatOverlay(
    open: boolean,
    onClose: () => void,
    onCreated?: (chatId: number) => void
) {
    const { user } = useUserContext();
    const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [groupName, setGroupName] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [existingChatId, setExistingChatId] = useState<number | null>(null);

    useEffect(() => {
        if (open) {
            setSelectedIds([]);
            setSearchTerm('');
            setGroupName('');
            setExistingChatId(null);
        }
    }, [open]);

    useEffect(() => {
        if (!open || !user) return;
        let cancelled = false;
        setLoadingUsers(true);
        (async () => {
            const matches = await getChatMatches();
            const friendsRaw = await getFriendList(user.username);
            const friends = (friendsRaw || []).map(f => ({
                id: f.userId,
                username: f.username,
                profilePicUrl: `/api/users/${f.userId}/profile-picture`,
            }));
            const combined = [...(matches || []), ...friends];
            const deduped = [...new Map(combined.map(u => [u.id, u])).values()];
            if (!cancelled) setAllUsers(deduped);
            if (!cancelled) setLoadingUsers(false);
        })();
        return () => { cancelled = true; };
    }, [open, user?.username]);

    useEffect(() => {
        if (selectedIds.length === 1 && user) {
            let cancelled = false;
            (async () => {
                const rawChats = await getChats();
                const chats = rawChats ?? [];
                const existing = chats.find(chat =>
                    !chat.isGroup &&
                    chat.memberIds.includes(user.id) &&
                    chat.memberIds.includes(selectedIds[0])
                );
                if (!cancelled) setExistingChatId(existing ? existing.id : null);
            })();
            return () => { cancelled = true; };
        } else {
            setExistingChatId(null);
        }
    }, [selectedIds, user]);

    const toggleUser = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (selectedIds.length === 0 || !user) return;
        setLoadingAction(true);
        if (existingChatId !== null) {
            onCreated?.(existingChatId);
            onClose();
            setLoadingAction(false);
            return;
        }
        const member_ids = Array.from(new Set([...selectedIds, user.id]));
        const isGroup = member_ids.length > 1;
        const title = isGroup ? groupName.trim() : undefined;
        const chatId = await createChat(member_ids, title);
        if (typeof chatId === 'number') {
            onCreated?.(chatId);
            onClose();
        }
        setLoadingAction(false);
    };

    const filteredUsers = allUsers.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        allUsers,
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
    };
}
