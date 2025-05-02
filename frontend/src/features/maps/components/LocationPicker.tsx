import { Autocomplete, Box, Container, ContainerProps, InputLabel, Slider, TextField, Typography } from "@mui/material";
import { AdvancedMarker, Map, useMap } from "@vis.gl/react-google-maps";
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { getPlaceData, getPlacePredictions } from "../mapsApi";
import { LatLngLiteral, Place, PlacePrediction } from "../mapsConstants";
import MapCircleOverlay from "./MapCircleOverlay";

const Geolocation = navigator.geolocation;

export default function LocationPicker({ onChange, containerProps, textInput = true, radiusSlider = true }: { onChange?: (location: Place | null, radius: number | null) => void, containerProps?: ContainerProps, textInput?: boolean, radiusSlider?: boolean }) {
    const MIN_RADIUS = 1;
    const MAX_RADIUS = 20;

    const { sx: containerPropsSx = {}, ...containerPropsRest } = containerProps || {};

    const map = useMap();

    const [place, setPlace] = useState<Place | null>(null);
    const [userCoordinates, setUserCoordinates] = useState<LatLngLiteral | null>(null);
    const [clickCoordinates, setClickCoordinates] = useState<LatLngLiteral | null>(null);
    const [searchInput, setSearchInput] = useState<string | null>(null);
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [searchedPlaceId, setSearchedPlaceId] = useState<string | null>(null);

    const [radius, setRadius] = useState<number>(5);

    useEffect(() => {
        if (onChange) {
            onChange(place, radius);
        }
    }, [place, radius]);

    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserCoordinates(coords);
                map?.panTo(coords);
            },
            (error) => console.error("Geolocation error:", error)
        );
    }, [map]);

    useEffect(() => {
        if (!searchInput) {
            return;
        }

        const fetchPlacePredictions = async () => {
            const response = await getPlacePredictions(searchInput);

            if (response) {
                setPredictions(response);
            }
        };

        fetchPlacePredictions();
    }, [searchInput]);

    useEffect(() => {
        if (!searchedPlaceId) {
            return;
        }

        const fetchSearchedLocation = async () => {
            const response = await getPlaceData(searchedPlaceId, false);

            if (response) {
                setPlace(response);
                map?.panTo(response.coordinates);
            }
        };

        fetchSearchedLocation();
    }, [searchedPlaceId]);

    useEffect(() => {
        if (!clickCoordinates) {
            return;
        }

        const fetchClickedLocation = async () => {
            const response = await getPlaceData(clickCoordinates, false);

            if (response) {
                setPlace(response);
            }
        };

        fetchClickedLocation();
    }, [clickCoordinates]);

    function handleSearchInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const value = event.target.value;

        if (!value) {
            setSearchInput(null);
            setPredictions([]);
            return;
        }

        setSearchInput(value);
    }

    function handlePlacePredictionSelection(_event: SyntheticEvent, value: PlacePrediction | null) {
        if (!value) {
            setSearchedPlaceId(null);
            return;
        }
        
        setSearchedPlaceId(value.placeId);
    }

    function handleRadiusSliderChange(_event: Event, value: number | number[]) {
        if (typeof(value) === "number") {
            setRadius(value);
        } else {
            setRadius(value[0]);
        }
    }

    return (
        <Container
            maxWidth = "lg"
            sx = {{
                display: "flex",
                flexDirection: "column",
                width: "70vw",
                height: "70vh",
                marginTop: "auto",
                ...containerPropsSx
            }}
            { ...containerPropsRest }
        >
            { textInput &&
                <Autocomplete
                    options = { predictions }
                    getOptionLabel = { (option) => option.text.text }
                    renderInput = { (params) => (
                        <TextField { ...params } onChange = { handleSearchInputChange } />
                    )
                    }
                    onChange = { handlePlacePredictionSelection }
                />
            }
            
            <Box flexGrow = { 1 }>
                <Map
                    mapId = "111f8ee2a113e89f"
                    onClick = { (event) => setClickCoordinates(event.detail.latLng) }
                    defaultCenter = { userCoordinates ?? { lat: 45.468558, lng: 9.182338 } }
                    defaultZoom = { 10 }
                    gestureHandling = { "greedy" }
                    disableDefaultUI
                >
                    { place?.coordinates &&
                        <>
                            { radius && radius > 0 &&
                                <MapCircleOverlay centre = { place.coordinates } radius = { radius } />
                            }
                            <AdvancedMarker
                                position = { place.coordinates }
                                onDrag = { (event) => { event.latLng && setClickCoordinates({
                                    lat: event.latLng.lat(),
                                    lng: event.latLng.lng()
                                }) } }
                                draggable
                                clickable
                            />
                        </>
                    }
                </ Map>
            </Box>

            { radiusSlider && 
                <Box marginTop = "0.25rem" width = "100%">
                    <InputLabel>Radius (km)</InputLabel>

                    <Box>
                        <Slider
                            sx = {{
                                width: "40%",
                                marginX: "auto"
                            }}
                            value = { radius }
                            valueLabelDisplay = "auto"
                            min = { MIN_RADIUS }
                            max = { MAX_RADIUS }
                            step = { 1 }
                            onChange = { handleRadiusSliderChange }
                            marks = {[
                                { value: 1, label: "1km" },
                                { value: 20, label: "20km" },
                            ]}
                        />
                    </Box>
                </Box>
            }

            {/* <Typography>
                { clickCoordinates && `${ clickCoordinates.lat }, ${ clickCoordinates.lng }` }
            </Typography> */}
            <Typography>
                { place?.locality && place?.country ?
                    `${ place.locality }, ${ place.country }`
                :
                    place?.country ?? "Select a location"
                }
            </Typography>
        </Container>
    );
}