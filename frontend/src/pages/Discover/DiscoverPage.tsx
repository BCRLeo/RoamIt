import { Box, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router";

import useUserContext from "../../features/auth/hooks/useUserContext";
import ListingList from "../../features/listings/components/ListingList";
import { MouseEvent, useState } from "react";
import Listing from "../../features/listings/components/Listing";
import { getListingRecommendations } from "../../features/matches/matchesApi";

export default function DiscoverPage() {
    const navigate = useNavigate();
    const user = useUserContext().user;
    const [listingId, setListingId] = useState<number | null>(null);
    const [recommendationIds, setRecommendationIds] = useState<number[]>([]);

    async function handleListingClick(_event: MouseEvent<HTMLDivElement>, listingId: number) {
        setListingId(listingId);

        const response = await getListingRecommendations(listingId);

        if (response.status === "success" && response.data) {
            setRecommendationIds(response.data);
        } else {
            setRecommendationIds([]);
        }
    }

    if (!user) {
        navigate("/");
        return null;
    }

    return (
        <Box sx = {{ 
            display: "flex", 
            flexDirection: "column", 
            height: "calc(100vh - 4rem)" // subtract nav bar height
        }}>
            <Typography variant = "h1">Discover</Typography>

            <Box sx = {{
                ...(listingId ? {
                    position: "fixed",
                    top: "4rem", // nav bar height
                    left: 0,
                    bottom: 0,
                    width: "15dvw",
                    marginLeft: "1rem",
                    paddingRight: "1rem",
                    boxShadow: 3
                } : {
                    width: "70%",
                    marginLeft: "auto"
                }),
                marginRight: "auto",
                flexGrow: 1,
                overflow: "auto"
            }}>
                <Typography
                    variant = { listingId ? "h5" : "h4" }
                    paddingTop = "1rem"
                >
                    { listingId ? "Your Listings" : "Select one of your listings" }
                </Typography>

                { listingId && (
                    <Divider sx = {{ marginY: "1rem" }} />
                )}

                <ListingList
                    username = { user.username}
                    compact = { listingId !== null }
                    onClick = { handleListingClick }
                />
            </Box>

            { recommendationIds && (
                recommendationIds.map((id) => (
                    <Listing key = { `listingRecommendation${ id }` } listingId = { id } />
                ))
            )}
        </Box>
    );
}