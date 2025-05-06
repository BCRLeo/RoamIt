import { TextField, Typography } from "@mui/material";
import { useListingData } from "../../hooks/useListingData";
import { ListingData } from "../../listingsConstants";
import { ChangeEvent, useState } from "react";

export default function Name(props: {
    listingData: ListingData,
    onEdit?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
} | {
    listingId: number,
    onEdit?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}) {
    const listingId = "listingId" in props ? props.listingId : undefined;
    const data = useListingData(listingId);
    const listingData = "listingData" in props ? props.listingData : data!;

    const [name, setName] = useState(listingData.location.name);

    function handleEdit(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if (props.onEdit) {
            props.onEdit(event);
        }

        setName(event.target.value);
    }

    if (props.onEdit) return (
        <TextField
            fullWidth
            label = "Name"
            variant = "outlined"
            margin = "normal"
            value = { name }
            onChange = { handleEdit }
        />
    );

    return (
        <Typography variant = "h2" pb = "1rem">
            { listingData.location.name || `Listing #${ listingData.id }` }
        </Typography>
    );
}