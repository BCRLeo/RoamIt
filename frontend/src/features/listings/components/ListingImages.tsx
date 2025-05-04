import { useSuspenseQuery } from "@tanstack/react-query";
import { getListingPictures } from "../listingsApi";
import { ImageList, ImageListItem, Typography } from "@mui/material";

export default function ListingImages({ listingId, canEdit = false }: { listingId: number, canEdit?: boolean }) {
    const { data: imagesResult } = useSuspenseQuery({
        queryKey: ["getListingPictures", listingId],
        queryFn: () => getListingPictures(listingId)
    });

    if (imagesResult.status === "error") return (
        <Typography variant = "caption">Failed to load listing pictures.</Typography>
    );

    const images = imagesResult.data;
    canEdit
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