import { ChatData, MessageData } from "./chatsConstants";

/**
 * Creates a chat composed of the given members with an optional title. If successful, returns the new chat ID.
 */
export async function createChat(userIds: number[], title?: string): Promise<number | null> {
    try {
        const response = await fetch("/api/chats", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                member_ids: userIds,
                title: title,
                is_group: (userIds.length > 2)
            })
        });
        const data = await response.json()

        if (response.ok) {
            return data.data;
        }

        throw Error(data.error);
    } catch (error) {
        console.error("Error creating chat:", error);
    }

    return null;
}

export async function getChats(): Promise<ChatData[] | null>;
export async function getChats(memberIds: number | number[]): Promise<ChatData | null>;
export async function getChats(memberIds: number | number[] = []) {
    if (typeof(memberIds) === "number") {
        memberIds = [memberIds];
    }

    let memberQueries: string[] = [];

    for (const id of memberIds) {
        memberQueries.push(`member_ids=${ id }`);
    }

    const memberQuery = memberIds.length ? "?" + memberQueries.join("&") : "";

    try {
        const response = await fetch(`/api/chats${ memberQuery }`, {
            credentials: "include"
        });
        const data = await response.json();

        if (response.ok) {
            return data.data;
        }

        throw Error(data.error);
    } catch (error) {
        console.error("Error retrieving chats:", error);
    }

    return null;
}

export async function getChatMessages(chatId: number): Promise<MessageData[] | null> {
    try {
        const response = await fetch(`/api/chats/${chatId}/messages`, {
            credentials: "include",
        });
        const data = await response.json();

        if (response.ok) {
            return data.data;
        }

        throw Error(data.error);
    } catch (error) {
        console.error(`Error retrieving chat #${chatId}'s messages:`, error);
    }

    return null;
}

export async function getChatMatches(): Promise<{ id: number, username: string, profilePicUrl: string }[] | null> {
    try {
        const response = await fetch("/api/chat-matches", {
            method: "GET",
            credentials: "include"
        });
        const data = await response.json();

        if (response.ok) {
            return data.data;
        }

        throw Error(data.error);
    } catch (error) {
        console.error("Error retrieving chat matches:", error);
    }

    return null;
}

export async function getChatData(chatId: number): Promise<{
    id: number;
    isGroup: boolean;
    title: string | null;
    members: { id: number; username: string; profilePicUrl: string }[];
    latestMessage: string | null;
    latestTime: string | null;
} | null> {
    try {
        const res = await fetch(`/api/chats/${chatId}`, { credentials: 'include' });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error);
        return payload;
    } catch (e) {
        console.error('Error loading chat data:', e);
        return null;
    }
}

export async function deleteChat(chatId: number): Promise<boolean> {
    try {
        const res = await fetch(`/api/chats/${chatId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!res.ok) {
            const payload = await res.json();
            throw new Error(payload.error || `Delete failed ${res.status}`);
        }
        return true;
    } catch (err) {
        console.error('Error deleting chat:', err);
        return false;
    }
}