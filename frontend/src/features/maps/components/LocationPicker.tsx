import { Autocomplete, Box, Container, ContainerProps, TextField, Typography } from "@mui/material";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { getLocationData, getPlacePredictions } from "../mapsApi";
import { LatLngLiteral, Location, PlacePrediction } from "../mapsConstants";

const Geolocation = navigator.geolocation;

export default function LocationPicker({ containerProps, textInput = true }: { containerProps?: ContainerProps, textInput?: boolean }) {
    const map = useMap();

    const [location, setLocation] = useState<Location | null>(null);
    const [userCoordinates, setUserCoordinates] = useState<LatLngLiteral | null>(null);
    const [clickCoordinates, setClickCoordinates] = useState<LatLngLiteral | null>(null);
    const [searchInput, setSearchInput] = useState<string | null>(null);
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [searchedPlaceId, setSearchedPlaceId] = useState<string | null>(null);

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
            const response = await getLocationData(searchedPlaceId, false);

            if (response) {
                setLocation(response);
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
            const response = await getLocationData(clickCoordinates, false);

            if (response) {
                setLocation(response);
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

    return (
        <Container
            maxWidth = "lg"
            sx = {{
                display: "flex",
                flexDirection: "column",
                width: "70vw",
                height: "70vh",
                marginTop: "auto"
            }}
            { ...containerProps }
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
                    { location?.coordinates &&
                        <AdvancedMarker
                            position = { location.coordinates }
                            draggable
                            clickable
                        />
                    }
                </ Map>
            </Box>

            <Typography>
                { clickCoordinates && `${ clickCoordinates.lat }, ${ clickCoordinates.lng }` }
            </Typography>
            <Typography>
                { location?.locality && location?.country ?
                    `${ location.locality }, ${ location.country }`
                :
                    location?.country
                }
            </Typography>
        </Container>
    );
}