import { useEffect, useState } from "react";

import { Button, Modal, Typography } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";

import PopUp from "../../../components/PopUp/PopUp";
import useUserContext from "../../auth/hooks/useUserContext";
import { getMatch } from "../matchesApi";
import { PublicUserData } from "../../auth/authApi";
import { getListingData } from "../../listings/listingsApi";
import { getUserData } from "../../accounts/accountsApi";
import { NavLink } from "react-router";
import { getChats } from "../../chats/chatsApi";

export default function MatchModal({ matchId }: { matchId: number }) {
    const { data } = useSuspenseQuery({
        queryKey: ["getMatch", matchId],
        queryFn: async () => {
            const response = await getMatch(matchId);
            if (response.status === "error" || !response.data) {
                return null;
            }

            const match = response.data;
            const listing1Response = await getListingData(match.listing1Id);
            const listing2Response = await getListingData(match.listing2Id);

            if (
                listing1Response.status === "error" || !listing1Response.data ||
                listing2Response.status === "error" || !listing2Response.data
            ) {
                return null;
            }

            const user1 = await getUserData(listing1Response.data.userId, true);
            const user2 = await getUserData(listing2Response.data.userId, true);

            if (!user1 || !user2) {
                return null;
            }

            const chat = await getChats([user1.id, user2.id]);

            return { match, user1, user2, chat };
        }
    });
    const { match, user1, user2, chat } = data || { match: null, user1: null, user2: null, chat: null };

    const currentUser = useUserContext().user;
    const [otherUser, setOtherUser] = useState<PublicUserData | null>(null);
    const [isOpen, setIsOpen] = useState(true);
        
    useEffect(() => {
        if (!user1 || !user2 || !currentUser) return;

        if (currentUser.id === user1.id) {
            setOtherUser(user2);
        } else {
            setOtherUser(user1);
        }
    }, [data, currentUser]);

    return (
        <Modal open = { isOpen } onClose = { () => setIsOpen(false) }>
            <PopUp>
                { match && otherUser && chat ? (
                    <>
                        <Typography variant = "h5">It's a match!</Typography>
                        <Button
                            component = { NavLink }
                            variant = "contained"
                            to = { `/chats/${ chat.id }` }
                            sx = {{ marginY: "1rem" }}
                        >
                            Start chatting with { otherUser.firstName }
                        </Button>
                    </>
                ) : (
                    <Typography variant = "caption">
                        Error: match not found.
                    </Typography>
                )}
            </PopUp>
        </Modal>
    )
}