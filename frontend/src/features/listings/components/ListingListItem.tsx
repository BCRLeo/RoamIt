import { MouseEvent } from "react";

import { Grid2, Grid2Props, Typography, Box } from "@mui/material";

import { Place } from "../../maps/mapsConstants";
import { getListingData } from "../listingsApi";
import { useSuspenseQuery } from "@tanstack/react-query";
import ListingImages from "./ListingImages";
import LocationDisplay from "../../maps/components/LocationDisplay";
import usePublicUserData from "../../accounts/hooks/usePublicUserData";

export default function ListingListItem({ listingId, gridProps, onClick, compact }: { listingId: number, gridProps?: Grid2Props, onClick?: (event: MouseEvent<HTMLDivElement>) => void, compact?: boolean }) {
    const { sx: gridPropsSx = {}, ...gridPropsRest } = gridProps ?? {};

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
    const { isAuthenticated } = usePublicUserData(listingData.userId);
    const place: Place = {
        coordinates: listingData.location.coordinates,
        country: listingData.location.country,
        locality: listingData.location.locality
    }
    const locationName = listingData.location.name;
    const { radius, category, nightlyBudget: budget, startDate, endDate, datesAreApproximate, description } = listingData;

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
                { isAuthenticated && (
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
                { isAuthenticated && (
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