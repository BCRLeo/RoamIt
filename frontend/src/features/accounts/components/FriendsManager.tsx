import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Avatar,
    Divider,
    CircularProgress,
} from "@mui/material";
import SearchUsers from "../../chats/components/SearchUsers";
import {
    acceptFriendRequest,
    declineFriendRequest,
    getFriendData,
    getIncomingFriendData,
    getProfilePicture,
    sendFriendRequest,
} from "../accountsApi";
import { createChat, getChats } from "../../chats/chatsApi";
import { getCurrentUser } from "../../auth/authApi"
import { useNavigate } from "react-router-dom";


interface User {
    id: number;
    username: string;
}

export default function FriendsManager() {
    const [search, setSearch] = useState("");
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [friends, setFriends] = useState<User[]>([]);
    const [incoming, setIncoming] = useState<User[]>([]);
    const [outgoing, setOutgoing] = useState<User[]>([]);
    const [sendingRequestTo, setSendingRequestTo] = useState<number | null>(null);
    const [profilePictures, setProfilePictures] = useState<{ [id: number]: string }>({});
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        getCurrentUser().then((user) => {
            if (user) setCurrentUserId(user.id);
        });
    }, []);

    useEffect(() => {
        getFriendData().then((res) => {
            if (!res) return;
            setFriends(res.accepted);
            setOutgoing(res.outgoing);
        });

        getIncomingFriendData().then((res) => {
            if (!res) return;
            setIncoming(res);
        });
    }, []);

    useEffect(() => {
        const usersToFetch = [...friends, ...incoming, ...outgoing];

        usersToFetch.forEach((user) => {
            if (!profilePictures[user.id]) {
                getProfilePicture(user.id).then((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        setProfilePictures((prev) => ({ ...prev, [user.id]: url }));
                    }
                });
            }
        });
    }, [friends, incoming, outgoing]);

    const filteredUsers = search
        ? allUsers.filter(
            (user) =>
                user.username.toLowerCase().startsWith(search.toLowerCase()) &&
                user.id !== currentUserId  // exclude oneself from search results
        )
        : [];

    useEffect(() => {
        if (!search) return;
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data.data)) {
                    setAllUsers(data.data);
                }
            });
    }, [search]);

    function handleAccept(username: string) {
        acceptFriendRequest(username).then(() => {
            setIncoming((prev) => prev.filter((u) => u.username !== username));
        });
    }

    function handleDecline(username: string) {
        declineFriendRequest(username).then(() => {
            setIncoming((prev) => prev.filter((u) => u.username !== username));
        });
    }

    async function handleChat(user: User) {
        const chats = await getChats();
        const existing = chats?.find((chat) =>
            !chat.isGroup && chat.memberIds.includes(user.id)
        );

        if (existing) {
            navigate(`/chats/${existing.id}`);
        } else {
            const id = await createChat([user.id]);
            if (id) navigate(`/chats/${id}`);
        }
    }

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mb: 2 }}>
            <SearchUsers value={search} onChange={setSearch} />
            {search && (
                <Box>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Search Results
                    </Typography>

                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                            const isFriend = friends.some((f) => f.id === user.id);
                            const isPending = outgoing.some((f) => f.id === user.id);

                            return (
                                <Box key={user.id} display="flex" alignItems="center" gap={1} py={1}>
                                    <Avatar
                                        src={profilePictures[user.id]}
                                        sx={{ width: 32, height: 32 }}
                                    />
                                    <Typography>
                                        @{user.username} {isFriend && "(Friend)"} {isPending && "(Pending)"}
                                    </Typography>
                                    {!isFriend && !isPending && (
                                        <Button
                                            size="small"
                                            onClick={async () => {
                                                setSendingRequestTo(user.id);
                                                const success = await sendFriendRequest(user.username);
                                                if (success) {
                                                    setOutgoing((prev) => [...prev, user]);
                                                }
                                                setSendingRequestTo(null);
                                            }}
                                            disabled={sendingRequestTo === user.id}
                                        >
                                            {sendingRequestTo === user.id ? (
                                                <CircularProgress size={16} />
                                            ) : (
                                                "Add"
                                            )}
                                        </Button>
                                    )}
                                </Box>
                            );
                        })
                    ) : (
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            No matches
                        </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />
                </Box>
            )}

            {incoming.length > 0 && (
                <Box>
                    <Typography variant="h6">Incoming Friend Requests</Typography>
                    {incoming.map((user) => (
                        <Box key={user.id} display="flex" alignItems="center" gap={1} py={1}>
                            <Avatar
                                src={profilePictures[user.id]}
                                sx={{ width: 32, height: 32 }}
                            />
                            <Typography>@{user.username}</Typography>
                            <Button
                                size="small"
                                onClick={() => handleAccept(user.username)}
                            >
                                Accept
                            </Button>
                            <Button
                                size="small"
                                onClick={() => handleDecline(user.username)}
                            >
                                Decline
                            </Button>
                        </Box>
                    ))}
                    <Divider sx={{ my: 2 }} />
                </Box>
            )}

            <Typography variant="h6">Friends</Typography>
            {friends.length > 0 ? (
                friends.map((user) => (
                    <Box key={user.id} display="flex" alignItems="center" justifyContent="space-between" py={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                                src={profilePictures[user.id]}
                                sx={{ width: 32, height: 32 }}
                            />
                            <Typography
                                onClick={() => navigate(`/users/@${user.username}`)}
                                sx={{ cursor: "pointer" }}
                            >
                                @{user.username}
                            </Typography>
                        </Box>
                        <Button size="small" onClick={() => handleChat(user)}>
                            Chat
                        </Button>
                    </Box>
                ))
            ) : (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    No friends added yet :(
                </Typography>
            )}
        </Box>
    );
}