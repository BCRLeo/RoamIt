import { Box, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router";

import useUserContext from "../../features/auth/hooks/useUserContext";
import ListingList from "../../features/listings/components/ListingList";
import { MouseEvent } from "react";
import { useToggleState } from "../../hooks/useToggleState";

export default function DiscoverPage() {
    const navigate = useNavigate();
    const user = useUserContext().user;
    const [isCompact, toggleIsCompact] = useToggleState(false);

    function handleListingClick(_event: MouseEvent<HTMLDivElement>, listingId: number) {
        console.log(listingId);
        toggleIsCompact();
    }

    if (!user) {
        navigate("/");
        return null;
    }

    return (
        <Box sx = {{ 
            display: "flex", 
            flexDirection: "column", 
            height: "calc(100vh - 4rem)" // subtract nav bar height
        }}>
            <Typography variant = "h1">Discover</Typography>

            <Box sx = {{
                ...(isCompact ? {
                    position: "fixed",
                    top: "4rem", // nav bar height
                    left: 0,
                    bottom: 0,
                    width: "15dvw",
                    marginLeft: "1rem",
                    paddingRight: "1rem",
                    boxShadow: 3
                } : {
                    width: "70%",
                    marginLeft: "auto"
                }),
                marginRight: "auto",
                flexGrow: 1,
                overflow: "auto"
            }}>
                <Typography
                    variant = { isCompact ? "h5" : "h4" }
                    paddingTop = "1rem"
                >
                    { isCompact ? "Your Listings" : "Select one of your listings" }
                </Typography>

                { isCompact && (
                    <Divider sx = {{ marginY: "1rem" }} />
                )}

                <ListingList
                    username = { user.username}
                    compact = { isCompact }
                    onClick = { handleListingClick }
                />
            </Box>
        </Box>
    );
}