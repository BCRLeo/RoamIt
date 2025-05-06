import { Box } from "@mui/material";
import { useListingData } from "../../hooks/useListingData";
import { ListingData } from "../../listingsConstants";
import ProfilePicture from "../../../accounts/components/ProfilePicture";
import { useNavigate } from "react-router";
import usePublicUserData from "../../../accounts/hooks/usePublicUserData";
import Name from "../../../accounts/components/Name";

export default function Profile(props: { listingData: ListingData } | { listingId: number }) {
    const listingId = "listingId" in props ? props.listingId : undefined;
    const data = useListingData(listingId);
    const listingData = "listingData" in props ? props.listingData : data!;

    const userId = listingData.userId;
    const { user } = usePublicUserData(userId);
    const navigate = useNavigate();

    return (
        <Box
            component = "div"
            sx = {{
                marginRight: "1rem",
                cursor: "pointer"
            }}
            onClick = { user ? () => navigate(`/users/${ user?.username }`) : undefined }
        >
            <ProfilePicture userId = { userId } size = "md" />
            <Name userId = { userId } />
        </Box>
    );
}