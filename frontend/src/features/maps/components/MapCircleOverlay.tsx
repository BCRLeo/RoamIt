import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { LatLngLiteral } from '../mapsConstants';

export default function MapCircleOverlay({ centre, radius }: { centre: LatLngLiteral, radius: number; }) {
    const map = useMap();
    const circleRef = useRef<google.maps.Circle | null>(null);

    useEffect(() => {
        if (!map || !window.google) return;

        if (circleRef.current) {
            circleRef.current.setMap(null);
        }
        
        const circle = new window.google.maps.Circle({
            map,
            center: centre,
            radius: radius * 1000,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
        });

        circleRef.current = circle;
        
        return () => {
            circle.setMap(null);
        };
    }, [map, centre, radius]);

    return null;
}
