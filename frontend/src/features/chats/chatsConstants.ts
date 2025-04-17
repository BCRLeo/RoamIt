export type ChatData = {
    id: number,
    isGroup: true,
    title?: string,
    memberIds: number[],
    creationDate: string,
    latestMessage?: string,
    latestTime?: string
}

export type MessageData = {
    id: number,
    senderId: number,
    chatId: number,
    content: string,
    fileUrl?: string,
    seen: boolean,
    timestamp: string
}