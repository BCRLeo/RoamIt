import { SyntheticEvent, MouseEventHandler } from "react";
import { AutocompleteChangeReason } from "@mui/material";
import Tags from "../../../components/Tags/Tags";
import { LISTING_TAG_OPTIONS } from "../listingsConstants";

export default function ListingTags(props: {
    userId: number
} | {
    userId: number,
    onEdit: ((event: SyntheticEvent, value: string[], reason: AutocompleteChangeReason) => void),
    onSave?: MouseEventHandler<HTMLButtonElement>
}) {
    return (
        <Tags { ...props } options = { [...LISTING_TAG_OPTIONS] } />
    );
}