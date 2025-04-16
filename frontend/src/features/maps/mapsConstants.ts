export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

export type AutocompleteSuggestion = typeof google.maps.places.AutocompleteSuggestion;
export type LatLngLiteral = google.maps.LatLngLiteral;
export type Location = {
    coordinates: LatLngLiteral,
    country: string,
    locality: string | null,
    placeId: string | null
};
export type PlacePrediction = google.maps.places.PlacePrediction;