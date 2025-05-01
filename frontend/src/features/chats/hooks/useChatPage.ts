import { useState, useEffect, RefObject } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../../features/auth/authApi';
import { getChatData, getChatMessages } from '../../../features/chats/chatsApi';
import { MessageData } from '../../../features/chats/chatsConstants';

const socket = io('http://127.0.0.1:5005', { autoConnect: false });


export function useChatInfo(chatId: number) {
    const [chatInfo, setChatInfo] = useState<{
        isGroup: boolean;
        title: string | null;
        members: { id: number; username: string; profilePicUrl: string }[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const info = await getChatData(chatId);
            if (!cancelled) {
                if (!info) {
                    navigate('/chats');
                } else {
                    setChatInfo(info);
                }
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [chatId, navigate]);

    return { chatInfo, loading };
}


export function useChatMessages(chatId: number) {
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const msgs = await getChatMessages(chatId);
            if (!cancelled && msgs) {
                setMessages(msgs);
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [chatId]);

    return { messages, setMessages, loading };
}

export function useChatSocket(chatId: number, onMessage: (msg: MessageData) => void) {
    useEffect(() => {
        let mounted = true;
        (async () => {
            const user = await getCurrentUser();
            if (!mounted || !user) return;
            if (!socket.connected) socket.connect();
            socket.emit('join', { chat_id: chatId });
            socket.off('receive_message').on('receive_message', onMessage);
        })();
        return () => {
            mounted = false;
            socket.off('receive_message');
            socket.emit('leave', { chat_id: chatId });
        };
    }, [chatId, onMessage]);
}


export function useAutoScroll(ref: RefObject<HTMLElement | null>, deps: any[]) {
    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, deps);
}
