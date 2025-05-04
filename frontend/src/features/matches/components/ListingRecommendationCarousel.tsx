import { Close, Favorite } from "@mui/icons-material";
import { Box, Fab, Typography } from "@mui/material";
import Listing from "../../listings/components/Listing";
import { useState } from "react";

export default function ListingRecommendationsCarousel({ listingIds }: { listingIds: number[] }) {
    const [index, setIndex] = useState<number | null>(0);

    function incrementIndex() {
        if (index === null) return;

        const nextIndex = index + 1;

        if (nextIndex < listingIds.length) {
            setIndex(nextIndex);
        } else {
            setIndex(null);
        }
    }

    function handlePass() {
        
        incrementIndex();
    }

    function handleLike() {
        
        incrementIndex();
    }

    if (index === null || !listingIds.length) return (
        <>
            <Typography variant = "h6">
                Looks like you're out of options...
            </Typography>
        </>
    );

    return (
        <>
            <Listing listingId = { listingIds[index] } />
            <Box
                sx = {{
                    display: "flex",
                    position: "fixed",
                    bottom: "50%",
                    left: "50%",
                    translate: "-50% calc(50% + 2rem)",
                    width: "63%",
                    justifyContent: "space-between"
                }}
            >
                <Fab
                    color = "primary"
                    aria-label = "pass"
                    sx = {{
                        height: "50dvh",
                        borderRadius: 8
                    }}
                    onClick = { handlePass }
                >
                    <Close />
                </Fab>
                <Fab
                    color = "secondary"
                    aria-label = "like"
                    sx = {{
                        height: "50dvh",
                        borderRadius: 8
                    }}
                    onClick = { handleLike }
                >
                    <Favorite />
                </Fab>
            </Box>
        </>
    );
}