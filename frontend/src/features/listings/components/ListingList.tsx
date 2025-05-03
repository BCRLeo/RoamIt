import { useSuspenseQuery } from "@tanstack/react-query";
import { getListingData } from "../listingsApi";
import NotFoundPage from "../../../pages/NotFound/NotFoundPage";
import ListingListItem from "./ListingListItem";
import { Divider } from "@mui/material";
import { Fragment } from "react/jsx-runtime";

export default function ListingList({ username }: { username: string, size?: "compact" | "full" }) {
    const { data: listingData } = useSuspenseQuery({
        queryKey: ["getListingData", username],
        queryFn: () => getListingData()
    });

    if (!listingData) return (
        <NotFoundPage />
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