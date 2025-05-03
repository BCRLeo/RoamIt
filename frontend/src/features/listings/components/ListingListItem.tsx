import { useEffect, useState } from "react";

import { Close } from "@mui/icons-material";
import { Badge, Grid2, ImageList, ImageListItem, IconButton, Grid2Props, Typography, Box } from "@mui/material";
import { Dayjs } from "dayjs";

import LocationPicker from "../../maps/components/LocationPicker";
import { useToggleState } from "../../../hooks/useToggleState";
import { Place } from "../../maps/mapsConstants";
import { getListingData } from "../listingsApi";
import { ListingCategory } from "../listingsConstants";
import { useSuspenseQuery } from "@tanstack/react-query";
import NotFoundPage from "../../../pages/NotFound/NotFoundPage";

export default function ListingListItem(props: { listingId: number, gridProps?: Grid2Props }) {
    const listingId = props.listingId;
    const gridProps = props.gridProps;

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
        <Box sx = {{
            textAlign: "left"
        }}>
            <Box sx = {{
                display: "flex"
            }}>
                <Typography
                    variant = "h2"
                    sx = {{
                        marginTop: "auto",
                        marginRight: "1rem",
                        lineHeight: "0.8",
                        borderRight: "0.1rem solid",
                        paddingRight: "1rem"
                    }}
                >
                    { locationName || `Listing #${ listingId }` }
                </Typography>
                <Typography
                    variant = "subtitle1"
                    sx = {{
                        marginTop: "auto",
                        height: "fit-content",
                        lineHeight: "1.15"
                    }}
                >
                    { category.charAt(0).toUpperCase() + category.slice(1) }<br />
                    { budget && `~${ budget } / night` }
                </Typography>
            </Box>

            <Grid2
                container
                spacing = { 1 }
                gap = { 1 }
                sx = {{
                    width: "100%",
                    margin: "auto",
                    ...gridPropsSx
                }}
                { ...gridPropsRest }
            >
                <Grid2 size = { 12 }>
                    <Typography
                        variant = "subtitle1"
                        sx = {{
                            display: "inline",
                            height: "fit-content"
                        }}
                    >
                        From { datesAreApproximate && "~" }{ startDate?.format("DD/MM/YYYY") }
                    </Typography>
                    { endDate && (
                        <Typography
                            variant = "subtitle1"
                            sx = {{
                                display: "inline",
                                height: "fit-content"
                            }}
                        >
                            { " " }until { datesAreApproximate && "~" }{ endDate?.format("DD/MM/YYYY") }
                        </Typography>
                    )}
                </Grid2>

                <Grid2 size = { 5 }>
                    <LocationPicker
                        defaultPlace = { place ?? undefined }
                        defaultRadius = { radius ?? undefined }
                        defaultZoom = { 9 }
                        containerProps = {{
                            sx: {
                                width: "100%",
                                height: "9rem",
                                marginX: 0,
                                paddingX: "0"
                            }
                        }}
                        disabled
                    />
                </Grid2>

                <Grid2 size = { 7 }>
                    <Typography
                        variant = "body1"
                        sx = {{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxHeight: "9rem",
                            WebkitLineClamp: 5,
                        }}
                    >
                        { description }
                    </Typography>
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
        </Box>
    );
}