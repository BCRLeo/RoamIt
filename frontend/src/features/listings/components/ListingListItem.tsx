import { MouseEvent, useEffect, useState } from "react";

import { Grid2, Grid2Props, Typography, Box } from "@mui/material";
import { Dayjs } from "dayjs";

import { useToggleState } from "../../../hooks/useToggleState";
import { Place } from "../../maps/mapsConstants";
import { getListingData } from "../listingsApi";
import { ListingCategory, ListingData } from "../listingsConstants";
import { useSuspenseQuery } from "@tanstack/react-query";
import NotFoundPage from "../../../pages/NotFound/NotFoundPage";
import ListingImages from "./ListingImages";
import useUserContext from "../../auth/hooks/useUserContext";
import LocationDisplay from "../../maps/components/LocationDisplay";

export default function ListingListItem(props: { listingId: number, gridProps?: Grid2Props, onClick?: (event: MouseEvent<HTMLDivElement>) => void, compact?: boolean }) {
    const listingId = props.listingId;
    const gridProps = props.gridProps;
    const onClick = props.onClick;
    const compact = props.compact;

    const { sx: gridPropsSx = {}, ...gridPropsRest } = gridProps ?? {};

    const currentUser = useUserContext().user;
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

    if (compact) return (
        <Box
            onClick = { onClick }
            sx = {{
                textAlign: "center",
                cursor: onClick ? 'pointer' : 'default' 
            }}
        >
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
                { currentUser?.id === listingData.userId && (
                    <Grid2 size = { 12 }>
                        <Typography
                            variant = "h4"
                            sx = {{
                                marginTop: "auto",
                                lineHeight: "0.9",
                            }}
                        >
                            { locationName || `Listing #${ listingId }` }
                        </Typography>
                    </Grid2>
                )}

                <Grid2 size = { 12 }>
                    <Typography
                        variant = "caption"
                        sx = {{
                            display: "inline",
                            height: "fit-content"
                        }}
                    >
                        From { datesAreApproximate && "~" }{ startDate?.format("DD/MM/YYYY") }
                    </Typography>
                    { endDate && (
                        <Typography
                            variant = "caption"
                            sx = {{
                                display: "inline",
                                height: "fit-content"
                            }}
                        >
                            { " " }until { datesAreApproximate && "~" }{ endDate?.format("DD/MM/YYYY") }
                        </Typography>
                    )}
                </Grid2>

                <Grid2 size = { 12 }>
                    { place ? (
                        <LocationDisplay
                            place = { place }
                            radius = { radius ?? undefined }
                            zoom = { 9 }
                            containerProps = {{
                                sx: {
                                    width: "100%",
                                    height: "9rem",
                                    marginX: 0,
                                    paddingX: "0"
                                }
                            }}
                        />
                    ) : (
                        <Typography variant = "caption">Failed to load listing location.</Typography>
                    )}
                </Grid2>
            </Grid2>
        </Box>
    );

    return (
        <Box
            onClick = { onClick }
            sx = {{
                textAlign: "left",
                cursor: onClick ? 'pointer' : 'default' 
            }}
        >
            <Box sx = {{
                display: "flex"
            }}>
                { currentUser?.id === listingData.userId && (
                    <Typography
                        variant = "h2"
                        sx = {{
                            marginTop: "auto",
                            marginRight: "1rem",
                            lineHeight: "0.9",
                            borderRight: "0.1rem solid",
                            paddingRight: "1rem"
                        }}
                    >
                        { locationName || `Listing #${ listingId }` }
                    </Typography>
                )}
                <Typography
                    variant = "subtitle1"
                    sx = {{
                        marginTop: "auto",
                        height: "fit-content",
                        lineHeight: "1.15"
                    }}
                >
                    { category.charAt(0).toUpperCase() + category.slice(1) }<br />
                    { budget && `~${ budget } ${ listingData.currency } / night` }
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
                    { place ? (
                        <LocationDisplay
                            place = { place }
                            radius = { radius ?? undefined }
                            zoom = { 9 }
                            containerProps = {{
                                sx: {
                                    width: "100%",
                                    height: "9rem",
                                    marginX: 0,
                                    paddingX: "0"
                                }
                            }}
                        />
                    ) : (
                        <Typography variant = "caption">Failed to load listing location.</Typography>
                    )}
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
                    <ListingImages listingId = { listingId } />
                </Grid2>
            </Grid2>
        </Box>
    );
}