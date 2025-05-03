import { Container, Typography } from "@mui/material";
import ListingFormModal from "../../features/listings/components/ListingFormModal";
import { useParams } from "react-router";
import Listing from "../../features/listings/components/Listing";

export default function ListingsPage({ listingId }: { listingId?: number }) {
    const listingIdString = useParams().listingId;

    if (listingIdString && /^\d+$/.test(listingIdString)) {
        listingId = Number(listingIdString);
    }

    if (listingId !== undefined) return (
        <Container maxWidth = "md">
            <Typography variant = "h1" gutterBottom>
                Listings
            </Typography>

            <Listing listingId = { listingId } />
        </Container>
    );

    return (
        <Container maxWidth = "md">
            <Typography variant = "h1" gutterBottom>
                Listings
            </Typography>
            
            <ListingFormModal
                buttonProps = {{
                    variant: "contained",
                    sx: { color: "inherit" }
                }}
            />
        </Container>
    );
}