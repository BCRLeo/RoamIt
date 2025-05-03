import { Fragment } from "react/jsx-runtime";

import { Divider, Typography } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";

import NotFoundPage from "../../../pages/NotFound/NotFoundPage";
import { getUserListingData } from "../listingsApi";
import ListingListItem from "./ListingListItem";

export default function ListingList({ username }: { username: string, size?: "compact" | "full" }) {
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
                <Fragment key = { `listing${ listing.id }` }>
                    <ListingListItem listingId = { listing.id} />
                    { listingData.length > 1  && <Divider sx = {{ marginY: "1.5rem" }} />}
                </Fragment>
            )) }
        </>
    );
}