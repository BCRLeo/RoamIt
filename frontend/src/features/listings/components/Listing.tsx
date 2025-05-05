import { Grid2, Grid2Props, Typography, Box } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import ProfilePicture from "../../accounts/components/ProfilePicture";
import { Place } from "../../maps/mapsConstants";
import { getListingData } from "../listingsApi";
import ListingImages from "./ListingImages";
import LocationDisplay from "../../maps/components/LocationDisplay";
import usePublicUserData from "../../accounts/hooks/usePublicUserData";
import ListingTags from "./ListingTags";

export default function Listing({ listingId, gridProps }: { listingId: number, gridProps?: Grid2Props }) {
    const { sx: gridPropsSx = {}, ...gridPropsRest } = gridProps ?? {};
    const navigate = useNavigate();

    const { data: listingData } = useSuspenseQuery({
        queryKey: [`getListingData`, listingId],
        queryFn: async () => { 
            const response = await getListingData(listingId);

            if (response.status === "error" || !response.data) {
                throw new Error("Failed to retrieve listing data.");
            };
            
            const listingData = response.data;
            
            return listingData;
        },
    });
    const { user, isAuthenticated } = usePublicUserData(listingData.userId);
    const place: Place = {
        coordinates: listingData.location.coordinates,
        country: listingData.location.country,
        locality: listingData.location.locality
    }
    const locationName = listingData.location.name;
    const { radius, category, nightlyBudget: budget, startDate, endDate, datesAreApproximate, prefersSameGender, description } = listingData;

    return (
        <>
            { isAuthenticated ? (
                <Typography variant = "h2" pb = "1rem">{ locationName || `Listing #${ listingId }` }</Typography>
            ) : (
                <Box
                    component = "div"
                    sx = {{
                        marginRight: "1rem",
                        cursor: "pointer"
                    }}
                    onClick = { user ? () => navigate(`/users/${ user?.username }`) : undefined }
                >
                    <ProfilePicture userId = { listingData.userId } size = "md" />
                    <Typography variant = "caption">{ user?.firstName } { user?.lastName}</Typography>
                </Box>
            )}

            <Typography variant = "subtitle1">
                { category.charAt(0).toUpperCase() + category.slice(1) } listing from { datesAreApproximate && "approximately" }  { startDate?.format("DD/MM/YYYY") }
                {
                    endDate && " until " + endDate.format("DD/MM/YYYY")
                }
            </Typography>

            { budget && (
                <Typography variant = "subtitle2">Budget: { budget } { listingData.currency } per night</Typography>
            )}
            { prefersSameGender && (
                <Typography variant = "subtitle2">Looking for same gender</Typography>
            )}

            <Grid2
                container
                spacing = { 2 }
                sx = {{
                    width: "55%",
                    margin: "2rem auto",
                    ...gridPropsSx
                }}
                { ...gridPropsRest }
            >
                <Grid2 size = { 12 }>
                    <ListingTags listingId = { listingId } />
                </Grid2>

                <Grid2 size = { 12 }>
                    { place ? (
                        <LocationDisplay
                            place = { place }
                            radius = { radius ?? undefined }
                            containerProps = {{
                                sx: {
                                    width: "100%",
                                    marginX: 0
                                }
                            }}
                        />
                    ) : (
                        <Typography variant = "caption">Failed to load listing location.</Typography>
                    )}
                </Grid2>

                <Grid2 size = { 12 }>
                    <Typography
                        variant = "body1"
                        maxWidth = "35rem"
                        textAlign = "left"
                        marginX = "auto"
                    >
                        { description }
                    </Typography>
                </Grid2>

                <Grid2 size = { 12 }>
                    <ListingImages listingId = { listingId } />
                </Grid2>
            </Grid2>
        </>
    );
}