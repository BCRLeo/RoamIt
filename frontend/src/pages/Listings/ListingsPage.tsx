import { Container, Typography } from "@mui/material";
import ListingFormModal from "../../features/listings/components/ListingFormModal";

export default function ListingsPage() {
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