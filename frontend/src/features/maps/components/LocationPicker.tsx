import { Container, Typography } from "@mui/material";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { getLocationData } from "../mapsApi";

const Geolocation = navigator.geolocation;

type LatLngLiteral = google.maps.LatLngLiteral;

export default function LocationPicker() {
    const map = useMap();
    const [currentCoordinates, setCurrentCoordinates] = useState<LatLngLiteral | null>(null);
    const [coordinates, setCoordinates] = useState<LatLngLiteral | null>(null);
    const [locationData, setLocationData] = useState<{ country: string | null, locality: string | null } | null>(null);

    function success(position: GeolocationPosition) {
        const currentCoords = position.coords;

        setCurrentCoordinates({
            lat: currentCoords.latitude,
            lng: currentCoords.longitude
        });

        if (map) {
            map.panTo({ lat: currentCoords.latitude, lng: currentCoords.longitude });
            console.log("pan");
        }    
    }

    useEffect(() => {
        Geolocation.getCurrentPosition(success, console.log);
        if (map) {
            console.log("map");
        }
    }, [map]);

    useEffect(() => {
        if (!coordinates) {
            return;
        }

        (async () => {
            setLocationData(await getLocationData(coordinates.lat, coordinates.lng, false));
        })();
    }, [coordinates])

    return (
        <Container maxWidth = "lg" sx = {{ height: "80vh" }}>
            <Map
                mapId = { "111f8ee2a113e89f" }
                onClick = { (event) => setCoordinates(event.detail.latLng) }
                defaultCenter = { !currentCoordinates ? { lat: 22.54992, lng: 0 } : currentCoordinates }
                defaultZoom = { 8 }
                gestureHandling = { "greedy" }
                disableDefaultUI = { true }
            >
                { coordinates &&
                    <AdvancedMarker
                        position = {{ lat: coordinates.lat, lng: coordinates.lng }}
                        title = "hi"
                        draggable
                        clickable
                    >
                        
                    </AdvancedMarker>
                }
            </ Map>
            

            <Typography>
                { coordinates ? coordinates.lat + ", " + coordinates.lng : null }
            </Typography>
            <Typography>
                { locationData?.locality && locationData?.country ? locationData?.locality + ", " + locationData?.country : locationData?.country }
            </Typography>
        </Container>
    );
}