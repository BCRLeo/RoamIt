import { Typography } from "@mui/material";
import { useListingData } from "../../hooks/useListingData";
import { ListingData } from "../../listingsConstants";

export default function CategoryAndDates(props: { listingData: ListingData } | { listingId: number }) {
    const listingId = "listingId" in props ? props.listingId : undefined;
    const data = useListingData(listingId);
    const listingData = "listingData" in props ? props.listingData : data!;
    const category = listingData.category;
    const startDate = listingData.startDate.format("DD/MM/YYYY");
    const endDate = listingData.endDate ? " until " + listingData.endDate.format("DD/MM/YYYY") : undefined;
    
    return (
        <Typography variant = "subtitle1">
            { category.charAt(0).toUpperCase() + category.slice(1) } listing from { listingData.datesAreApproximate && "approximately" } { startDate }
            { endDate }
        </Typography>
    );
}