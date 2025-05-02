import { PlacePrediction, GOOGLE_API_KEY, LatLngLiteral, Place } from "./mapsConstants";

export async function getPlaceData(placeId: string, shortenCountryCode: boolean): Promise<Place | null>;
export async function getPlaceData(coordinates: LatLngLiteral, shortenCountryCode: boolean): Promise<Place | null>;
export async function getPlaceData(placeIdOrCoordinates: string | LatLngLiteral, shortenCountryCode: boolean = true): Promise<Place | null> {
    let country: string | null = null;
    let locality: string | null = null;
    let coordinates: LatLngLiteral | null = null;
    let placeId: string | null = null;

    const query = typeof(placeIdOrCoordinates) === "string" ? `place_id=${ placeIdOrCoordinates }` : `latlng=${ placeIdOrCoordinates.lat },${ placeIdOrCoordinates.lng }`;
    
    try {
        if (typeof(placeIdOrCoordinates) !== "string" && (Math.abs(placeIdOrCoordinates.lat) > 90 || Math.abs(placeIdOrCoordinates.lng) > 180)) {
            throw Error(`Latitude and longitude must fall within [-90, 90] and [-180, 180] respectively.`);
        }

        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${ query }&key=${ GOOGLE_API_KEY }`);

        if (!response.ok) {
            throw Error(response.statusText);
        }

        const data = await response.json();

        if (data["status"] !== "OK" || !data["results"].length) {
            throw Error(data["status"]);
        }

        for (const result of data["results"]) {
            for (const component of result["address_components"]) {
                if (!country && component["types"].includes("country") && component["short_name"]) {
                    country = component[shortenCountryCode ? "short_name" : "long_name"];
                }
    
                if (!locality && component["types"].includes("locality") && component["long_name"]) {
                    locality = component["long_name"];
                }
                
            }

            if (!coordinates && result["geometry"]["location"]) {
                coordinates = result["geometry"]["location"]
            }

            if (!placeId && result["place_id"]) {
                placeId = result["place_id"]
            }
        }

        if (!coordinates) {
            throw Error("No coordinates found.");
        }

        if (!country && !locality) {
            throw Error("No country or locality found.");
        }

        if (!country) {
            return null;
        }
        
        return {
            id: placeId ?? undefined,
            coordinates: coordinates,
            country: country,
            locality: locality ?? undefined,
        };
    } catch (error) {
        const representation = typeof(placeIdOrCoordinates) === "string" ? "place #" + placeIdOrCoordinates : `(${ placeIdOrCoordinates.lat }, ${ placeIdOrCoordinates.lng })`;

        console.error(`Failed to retrieve location data for ${ representation }:`, error);
        return null;
    }   
}

export async function getPlacePredictions(input: string): Promise<PlacePrediction[] | null>;
export async function getPlacePredictions(input: string, latitude: number, longitude: number, radius: number): Promise<PlacePrediction[] | null>;
export async function getPlacePredictions(input: string, latitude?: number, longitude?: number, radius?: number): Promise<PlacePrediction[] | null> {
    try {
        const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
            method: "POST",
            body: JSON.stringify({
                input: input,
                locationBias: latitude !== undefined ? {
                    circle: {
                        latitude: latitude,
                        longitude: longitude
                    },
                    radius: radius
                } : undefined
            }),
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_API_KEY
            }
        });
        
        if (!response.ok) {
            throw Error(response.statusText);
        }

        const data = await response.json();
        
        if (!data) {
            throw Error("No results found.");
        }

        const results: PlacePrediction[] = [];

        for (const entry of data["suggestions"]) {
            if (entry.hasOwnProperty("placePrediction")) {
                results.push(entry["placePrediction"]);
            }
        }

        return results.length ? results : null;
    } catch (error) {
        console.error(`Failed to retrieve places autocomplete results for ${ input }:`, error);
    }
    return null;
}