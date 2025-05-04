import { useEffect, useState } from "react";

import { Grid2, Grid2Props, Typography, Box } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";
import { useNavigate } from "react-router";

import { useToggleState } from "../../../hooks/useToggleState";
import NotFoundPage from "../../../pages/NotFound/NotFoundPage";
import { PublicUserData } from "../../auth/authApi";
import ProfilePicture from "../../accounts/components/ProfilePicture";
import LocationPicker from "../../maps/components/LocationPicker";
import { Place } from "../../maps/mapsConstants";
import { getListingData } from "../listingsApi";
import { ListingCategory, ListingData } from "../listingsConstants";
import { getUserData } from "../../accounts/accountsApi";
import ListingImages from "./ListingImages";

export default function Listing(props: { listingId: number, gridProps?: Grid2Props }) {
    const listingId = props.listingId;
    const gridProps = props.gridProps;
    const { sx: gridPropsSx = {}, ...gridPropsRest } = gridProps ?? {};

    const navigate = useNavigate();

    const [user, setUser] = useState<PublicUserData | null>(null);
    // replace with ListingData object?
    const [place, setPlace] = useState<Place | null>(null);
    const [radius, setRadius] = useState<number | null>(null);
    const [locationName, setLocationName] = useState("");
    const [category, setCategory] = useState<ListingCategory | "">("");
    const [budget, setBudget] = useState<number | null>(null);
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [datesAreApproximate, toggleDatesAreApproximate] = useToggleState(false);
    const [prefersSameGender, togglePrefersSameGender] = useToggleState(false);
    const [description, setDescription] = useState("");

    const { data: listingResponse } = useSuspenseQuery({
        queryKey: [`getListingData`, listingId],
        queryFn: () => getListingData(listingId),
    });

    const [listingData, setListingData] = useState<ListingData | null | undefined>();

    useEffect(() => {        
        if (!listingResponse || listingResponse.status === "error") return;

        setListingData(listingResponse.data);
    }, [listingResponse]);

    useEffect(() => {
        if (!listingData) return;

        (async () => {
            setUser(await getUserData(listingData.userId, true));
        })();
        
        setPlace({
            coordinates: listingData.location.coordinates,
            country: listingData.location.country,
            locality: listingData.location.locality
        });
        setRadius(listingData.radius);
        setLocationName(listingData.location.name ?? "");
        setCategory(listingData.category);
        setBudget(listingData.nightlyBudget ?? null);
        setStartDate(listingData.startDate);
        setEndDate(listingData.endDate ?? null);
        if (datesAreApproximate !== listingData.datesAreApproximate) {
            toggleDatesAreApproximate();
        }
        if (prefersSameGender !== listingData.prefersSameGender) {
            togglePrefersSameGender();
        }
        setDescription(listingData.description);
    }, [listingData]);

    if (!listingData) {
        return <NotFoundPage />;
    }

    return (
        <>
            <Typography variant = "h2" pb = "1rem">{ locationName || `Listing #${ listingId }` }</Typography>
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
                    <LocationPicker
                        defaultPlace = { place ?? undefined }
                        defaultRadius = { radius ?? undefined }
                        containerProps = {{
                            sx: {
                                width: "100%",
                                marginX: 0
                            }
                        }}
                        disabled
                    />
                </Grid2>

                <Grid2 size = { 12 } display = "flex" marginX = "auto" justifyContent = "center">
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
                    <Typography
                        variant = "body1"
                        maxWidth = "35rem"
                        textAlign = "left"
                        marginLeft = "1rem"
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