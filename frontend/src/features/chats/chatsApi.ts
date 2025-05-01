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

export async function getChats(): Promise<ChatData[] | null> {
    try {
        const response = await fetch("/api/chats", {
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
        const response = await fetch(`/api/chats/${ chatId }/messages`, {
            credentials: "include",
        });
        const data = await response.json();

        if (response.ok) {
            return data.data;
        }

        throw Error(data.error);
    } catch (error) {
        console.error(`Error retrieving chat #${ chatId }'s messages:`, error);
    }

    return null;
}