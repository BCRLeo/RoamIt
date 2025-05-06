import { useSuspenseQuery } from "@tanstack/react-query";
import { AutocompleteChangeReason, ImageList, ImageListItem, Typography } from "@mui/material";
import { getListingPictures } from "../../listingsApi";
import { SyntheticEvent, MouseEventHandler } from "react";
import { ListingData } from "../../listingsConstants";
import { useListingData } from "../../hooks/useListingData";

export default function Images(props: {
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

    const { data: imagesResult } = useSuspenseQuery({
        queryKey: ["getListingPictures", listingData.id],
        queryFn: () => getListingPictures(listingData.id)
    });

    if (imagesResult.status === "error") return (
        <Typography variant = "caption">Failed to load listing pictures.</Typography>
    );

    const images = imagesResult.data;
    
    if (!images) return;

    return (
        <ImageList
            variant = "masonry"
            cols = { 3 }
            gap = { 8 }
            sx = {{
                height: "30dvh",
                display: "flex",
                overflowX: "auto",
                overflowY: "hidden",
                whiteSpace: "nowrap",
                gap: 2
            }}
        >
            { images.map((image, index) => {
                const url = URL.createObjectURL(image);
                return (
                    <ImageListItem key = { `Listing#${ listingId }Picture#${ index }` }>
                        <img
                            src = { url }
                            style = {{
                                height: "100%",
                                objectFit: "contain",
                                borderRadius: "8px"
                            }}
                        />
                    </ImageListItem>
                );
            })}
        </ImageList>
    );
}