import { Typography } from "@mui/material";
import { useListingData } from "../../hooks/useListingData";
import { ListingData } from "../../listingsConstants";

export default function Description(props: { listingData: ListingData } | { listingId: number }) {
    const listingId = "listingId" in props ? props.listingId : undefined;
    const data = useListingData(listingId);
    const listingData = "listingData" in props ? props.listingData : data!;

    return (
        <Typography
            variant = "body1"
            maxWidth = "35rem"
            textAlign = "left"
            marginX = "auto"
        >
            { listingData.description }
        </Typography>
    );
}