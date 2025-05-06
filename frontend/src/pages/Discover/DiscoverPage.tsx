import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router";

import useUserContext from "../../features/auth/hooks/useUserContext";
import ListingList from "../../features/listings/components/ListingList";
import { MouseEvent, Suspense, useEffect, useState } from "react";
import { getListingRecommendations, swipeListing } from "../../features/matches/matchesApi";
import ListingRecommendationsCarousel from "../../features/matches/components/ListingRecommendationCarousel";
import { MatchData } from "../../features/matches/matchesConstants";
import MatchModal from "../../features/matches/components/MatchModal";

export default function DiscoverPage() {
    const navigate = useNavigate();
    const user = useUserContext().user;
    const [listingId, setListingId] = useState<number | null>(null);
    const [recommendationIds, setRecommendationIds] = useState<number[] | null>(null);
    const [match, setMatch] = useState<MatchData | null>(null);

    async function handleListingClick(_event: MouseEvent<HTMLDivElement>, listingId: number) {
        setListingId(listingId);

        const response = await getListingRecommendations(listingId);

        if (response.status === "error") {
            return;
        }
        
        if (response.data) {
            setRecommendationIds(response.data);
        } else {
            setRecommendationIds([]);
        }
    }

    async function handleMatch(matchData: MatchData) {
        setMatch(matchData);
    }

    async function handleSwipe(_event: MouseEvent<HTMLButtonElement>, onListingId: number, isLike: boolean) {        
        if (!listingId) return;
        
        const response = await swipeListing(listingId, onListingId, isLike);

        if (response.status === "error") {
            console.error(`Failed to swipe on listing #${ onListingId }:`, response.message);
            return;
        }

        const matchData = response.data;

        if (matchData) {
            handleMatch(matchData);
        }
    }

    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user]);

    if (!user) {
        return;
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
                <Suspense fallback = { <CircularProgress sx = {{ position: "fixed", left: "50%", top: "50%", translate: "-50% -50%" }} /> }>
                    <ListingRecommendationsCarousel
                        listingIds = { recommendationIds }
                        onChange = { handleSwipe }
                    />
                </Suspense>
            )}

            { match && (
                <MatchModal matchId = { match.id } />
            )}
        </Box>
    );
}