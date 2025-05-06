import { useListingData } from "../../hooks/useListingData";
import { ListingData } from "../../listingsConstants";
import { Place } from "../../../maps/mapsConstants";
import LocationDisplay from "../../../maps/components/LocationDisplay";

export default function Location(props: { listingData: ListingData } | { listingId: number }) {
    const listingId = "listingId" in props ? props.listingId : undefined;
    const data = useListingData(listingId);
    const listingData = "listingData" in props ? props.listingData : data!;
    const radius = listingData.radius;
    const place: Place = {
        coordinates: listingData.location.coordinates,
        country: listingData.location.country,
        locality: listingData.location.locality
    }
    
    return (
        <LocationDisplay
            place = { place }
            radius = { radius }
            containerProps = {{
                sx: {
                    width: "100%",
                    marginX: 0
                }
            }}
        />
    );
}