import { MouseEvent } from "react";

import { Box, Divider, Typography } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";

import NotFoundPage from "../../../pages/NotFound/NotFoundPage";
import { getUserListingData } from "../listingsApi";
import ListingListItem from "./ListingListItem";

export default function ListingList({ username, onClick, compact }: { username: string, onClick?: (event: MouseEvent<HTMLDivElement>, listingId: number) => void, compact?: boolean }) {
    const { data: listingResponse } = useSuspenseQuery({
        queryKey: ["getUserListingData", username],
        queryFn: () => getUserListingData(username)
    });

    if (listingResponse.status === "error") return (
        <NotFoundPage />
    );

    const listingData = listingResponse.data;

    if (!listingData) return (
        <Typography variant = "h6">Looks like @{ username } doesn't have any listings yet...</Typography>
    );
    
    return (
        <>
            { listingData.map((listing) => (
                <Box key = { `listing${ listing.id }` }>
                    <Divider sx = {{ marginY: "1.5rem" }} />
                    <ListingListItem
                        listingId = { listing.id}
                        onClick = { onClick ? (event) => onClick(event, listing.id) : undefined }
                        compact = { compact }
                    />
                </Box>
            )) }
        </>
    );
}