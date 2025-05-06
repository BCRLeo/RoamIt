import { Typography } from "@mui/material";
import { useListingData } from "../../hooks/useListingData";
import { ListingData } from "../../listingsConstants";

export default function Name(props: { listingData: ListingData } | { listingId: number }) {
    const listingId = "listingId" in props ? props.listingId : undefined;
    const data = useListingData(listingId);
    const listingData = "listingData" in props ? props.listingData : data!;

    return (
        <Typography variant = "h2" pb = "1rem">
            { listingData.location.name || `Listing #${ listingData.id }` }
        </Typography>
    );
}