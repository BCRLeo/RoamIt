export type ChatData = {
    id: number;
    isGroup: boolean;
    title?: string;
    memberIds: number[];
    creationDate: string;
    latestMessage?: string;
    latestTime?: string;
};

export type MessageData = {
    id: number,
    senderId: number,
    senderUsername: string;
    senderProfilePicUrl?: string;
    chatId: number,
    content: string,
    fileUrl?: string,
    seen: boolean,
    timestamp: string
}