import { SyntheticEvent, MouseEventHandler } from "react";
import { AutocompleteChangeReason } from "@mui/material";
import Tags from "../../../components/Tags/Tags";
import { LISTING_TAG_OPTIONS } from "../listingsConstants";
import { getListingTags } from "../listingsApi";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function ListingTags(props: {
    listingId: number
} | {
    listingId: number,
    onEdit: ((event: SyntheticEvent, value: string[], reason: AutocompleteChangeReason) => void),
    onSave?: MouseEventHandler<HTMLButtonElement>
}) {
    const listingId = props.listingId;

    const { data: tags } = useSuspenseQuery({
        queryKey: ["getListingTags", listingId],
        queryFn: async () => {
            const response = await getListingTags(listingId);

            if (response.status === "error" || !response.data) return null;

            return response.data;
        }
    });

    return (
        <Tags
            tags = { tags ?? undefined }
            onEdit = { "onEdit" in props ? props.onEdit : undefined }
            onSave = { "onSave" in props ? props.onSave : undefined }
            options = { [...LISTING_TAG_OPTIONS] }
        />
    );
}