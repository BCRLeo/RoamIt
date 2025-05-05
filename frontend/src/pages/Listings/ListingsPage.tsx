import { MouseEvent } from "react";

import { Container, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";

import useUserContext from "../../features/auth/hooks/useUserContext";
import Listing from "../../features/listings/components/Listing";
import ListingFormModal from "../../features/listings/components/ListingFormModal";
import ListingList from "../../features/listings/components/ListingList";
import NotFoundPage from "../NotFound/NotFoundPage";
import usePublicUserData from "../../features/accounts/hooks/usePublicUserData";

export default function ListingsPage() {
    const listingIdString = useParams().listingId;
    const username = useParams().username;
    const currentUser = useUserContext().user;

    const navigate = useNavigate();

    let searchUsername: string = "";

    if (username) {
        searchUsername = username;
    } else if (currentUser) {
        searchUsername = currentUser.username;
    }

    const { user, isAuthenticated } = usePublicUserData(searchUsername);

    let listingId: number | undefined = undefined;

    if (listingIdString && /^\d+$/.test(listingIdString)) {
        listingId = Number(listingIdString);
    }

    function handleListingClick(_event: MouseEvent<HTMLDivElement>, listingId: number) {
        navigate(`/listings/${listingId}`);
    }

    if (listingId !== undefined) return (
        <Container maxWidth = "xl">
            <Typography variant = "h1" gutterBottom>
                Listings
            </Typography>

            <Listing listingId = { listingId } />
        </Container>
    );

    if (!user) return (
        <NotFoundPage />
    );

    return (
        <Container maxWidth = "md">
            <Typography variant = "h1" gutterBottom>
                Listings
            </Typography>

            { isAuthenticated && (
                <ListingFormModal
                    buttonProps = {{
                        variant: "contained",
                        sx: {
                            marginBottom: "1rem",
                            color: "inherit"
                        }
                    }}
                />
            )}

            <ListingList username = { user.username } onClick = { handleListingClick } />
        </Container>
    );
}