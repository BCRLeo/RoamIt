import { Typography } from "@mui/material";
import { useListingData } from "../../hooks/useListingData";
import { ListingData } from "../../listingsConstants";

export default function Category(props: { listingData: ListingData } | { listingId: number }) {
    const listingId = "listingId" in props ? props.listingId : undefined;
    const data = useListingData(listingId);
    const listingData = "listingData" in props ? props.listingData : data!;
    const category = listingData.category;
    
    return (
        <Typography variant = "subtitle1">
            { category.charAt(0).toUpperCase() + category.slice(1) } listing
        </Typography>
    );
}