export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

export type AutocompleteSuggestion = typeof google.maps.places.AutocompleteSuggestion;

export type LatLngLiteral = google.maps.LatLngLiteral;

export type Location = {
    id: number;
    name?: string;
    coordinates: LatLngLiteral;
    country: string;
    locality?: string;
};

export type Place = {
    id?: string;
    coordinates: LatLngLiteral;
    country: string;
    locality?: string;
}

export type PlacePrediction = google.maps.places.PlacePrediction;