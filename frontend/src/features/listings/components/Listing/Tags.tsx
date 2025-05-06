import { SyntheticEvent, MouseEventHandler } from "react";
import { AutocompleteChangeReason } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getListingTags } from "../../listingsApi";
import { LISTING_TAG_OPTIONS, ListingData } from "../../listingsConstants";
import GenericTags from "../../../../components/Tags/Tags";
import { useListingData } from "../../hooks/useListingData";

export default function Tags(props: {
    listingData: ListingData
} | {
    listingData: ListingData,
    onEdit: ((event: SyntheticEvent, value: string[], reason: AutocompleteChangeReason) => void),
    onSave?: MouseEventHandler<HTMLButtonElement>
} | {
    listingId: number
} | {
    listingId: number,
    onEdit: ((event: SyntheticEvent, value: string[], reason: AutocompleteChangeReason) => void),
    onSave?: MouseEventHandler<HTMLButtonElement>
}) {
    const listingId = "listingId" in props ? props.listingId : undefined;
    const data = useListingData(listingId);
    const listingData = "listingData" in props ? props.listingData : data!;

    const { data: tags } = useSuspenseQuery({
        queryKey: ["getListingTags", listingData.id],
        queryFn: async () => {
            const response = await getListingTags(listingData.id);

            if (response.status === "error" || !response.data) return null;

            return response.data;
        }
    });

    return (
        <GenericTags
            tags = { tags ?? undefined }
            onEdit = { "onEdit" in props ? props.onEdit : undefined }
            onSave = { "onSave" in props ? props.onSave : undefined }
            options = { [...LISTING_TAG_OPTIONS] }
        />
    );
}