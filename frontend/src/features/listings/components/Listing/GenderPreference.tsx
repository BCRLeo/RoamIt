import { Typography } from "@mui/material";
import { useListingData } from "../../hooks/useListingData";
import { ListingData } from "../../listingsConstants";

export default function GenderPreference(props: { listingData: ListingData } | { listingId: number }) {
    const listingId = "listingId" in props ? props.listingId : undefined;
    const data = useListingData(listingId);
    const listingData = "listingData" in props ? props.listingData : data!;

    if (!listingData.prefersSameGender) return;

    return (
        <Typography variant = "subtitle2">
            Looking for same gender
        </Typography>
    );
}