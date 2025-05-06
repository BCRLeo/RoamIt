import { Typography } from "@mui/material";
import { useListingData } from "../../hooks/useListingData";
import { ListingData } from "../../listingsConstants";

export default function Budget(props: { listingData: ListingData } | { listingId: number }) {
    const listingId = "listingId" in props ? props.listingId : undefined;
    const data = useListingData(listingId);
    const listingData = "listingData" in props ? props.listingData : data!;
    const budget = listingData.nightlyBudget;

    if (!budget) return;

    return (
        <Typography variant = "subtitle2">
            Budget: { budget } { listingData.currency } per night
        </Typography>
    );
}