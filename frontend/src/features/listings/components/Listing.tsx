import { useEffect, useState } from "react";

import { Close } from "@mui/icons-material";
import { Badge, Grid2, ImageList, ImageListItem, IconButton, Grid2Props, Typography } from "@mui/material";
import { Dayjs } from "dayjs";

import LocationPicker from "../../maps/components/LocationPicker";
import { useToggleState } from "../../../hooks/useToggleState";
import { Place } from "../../maps/mapsConstants";
import { getListingData } from "../listingsApi";
import { ListingCategory } from "../listingsConstants";
import { useSuspenseQuery } from "@tanstack/react-query";
import NotFoundPage from "../../../pages/NotFound/NotFoundPage";

export default function Listing(props: { listingId: number, gridProps?: Grid2Props }) {
    const gridProps = props.gridProps;
    const listingId = props.listingId;

    const { sx: gridPropsSx = {}, ...gridPropsRest } = gridProps ?? {};

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
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);

    const { data: listingData } = useSuspenseQuery({
        queryKey: [`getListingData`, listingId],
        queryFn: () => listingId ? getListingData(listingId) : null,
    });

    useEffect(() => {
        if (!listingData) return;

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

    function handleRemoveImage(index: number) {
        const updated = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(updated);
    }

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
                <Typography variant = "subtitle2">Budget: { budget } per night</Typography>
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

                <Grid2 size = { 12 }>
                    <Typography variant = "body1">{ description }</Typography>
                </Grid2>

                <Grid2 size = { 12 }>
                    { !!uploadedImages.length &&
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
                        { uploadedImages.map((file, index) => {
                            const url = URL.createObjectURL(file);
                            return (
                                <ImageListItem key = { `${index}_${file.name}` } sx = {{ height: "100%" }}>
                                    <Badge
                                        overlap = "circular"
                                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                        badgeContent = {
                                            <IconButton
                                                size = "small"
                                                onClick = { () => handleRemoveImage(index) }
                                                sx = { (theme) => ({
                                                    backgroundColor: theme.palette.background.default,
                                                    color: "red",
                                                    borderRadius: "50%",
                                                    "&:hover": {
                                                        backgroundColor: "#ffe6e6",
                                                    },
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                })}
                                            >
                                                <Close sx={{ fontSize: 18, fontWeight: "bold" }} />
                                            </IconButton>
                                        }
                                        sx = {{ width: length, height: length }}
                                    >
                                        <img
                                            src = { url }
                                            style = {{
                                                height: "100%",
                                                objectFit: "contain",
                                                borderRadius: "8px"
                                            }}
                                        />
                                    </Badge>
                                </ImageListItem>
                            );
                        })}
                    </ImageList>
                    }
                </Grid2>
            </Grid2>
        </>
    );
}