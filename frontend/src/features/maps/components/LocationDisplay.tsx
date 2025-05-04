import { Box, Container, ContainerProps, Typography } from "@mui/material";
import { Map } from "@vis.gl/react-google-maps";
import { Place } from "../mapsConstants";
import MapCircleOverlay from "./MapCircleOverlay";

export default function LocationDisplay({
    place,
    radius,
    zoom,
    containerProps
}: {
    place: Place,
    radius?: number,
    zoom?: number,
    containerProps?: ContainerProps,
}) {
    const { sx: containerPropsSx = {}, ...containerPropsRest } = containerProps || {};

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
            <Box flexGrow = { 1 }>
                <Map
                    /* mapId = "111f8ee2a113e89f" */
                    defaultCenter = { place.coordinates }
                    defaultZoom = { zoom ?? 10.5 }
                    center = { place.coordinates }
                    zoom = { zoom ?? 10.5 }
                    disableDefaultUI
                    controlled
                >
                    { radius && radius > 0 &&
                        <MapCircleOverlay centre = { place.coordinates } radius = { radius } />
                    }
                </ Map>
            </Box>

            <Typography textAlign = "center">
                { place.locality && place.country ?
                    `${ place.locality }, ${ place.country }`
                :
                    place.country
                }
            </Typography>
        </Container>
    );
}