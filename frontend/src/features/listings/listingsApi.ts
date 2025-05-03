import { Dayjs } from "dayjs";
import { LatLngLiteral } from "../maps/mapsConstants";
import { ListingCategory, ListingData } from "./listingsConstants";

export async function createListing({
    coordinates,
    radius,
    locationName,
    category,
    nightlyBudget,
    endDate,
    startDate,
    datesAreApproximate,
    prefersSameGender,
    description,
    images
}: {
    coordinates: LatLngLiteral,
    radius: number,
    category: ListingCategory,
    startDate: Dayjs,
    datesAreApproximate: boolean,
    prefersSameGender: boolean,
    description: string,
    locationName?: string,
    endDate?: Dayjs,
    nightlyBudget?: number,
    images?: File | File[]
}): Promise<number | null> {
    if (images && images instanceof File) {
        images = [images];
    }

    const formData = new FormData();
    formData.append("latitude", coordinates.lat.toString());
    formData.append("longitude", coordinates.lng.toString());
    if (locationName) formData.append("location_name", locationName.trim());
    formData.append("radius", radius.toString());
    formData.append("category", category);
    if (nightlyBudget && nightlyBudget > 0) formData.append("nightly_budget", nightlyBudget.toString());
    formData.append("start_date", startDate.format("YYYY-MM-DD"));
    if (endDate) formData.append("end_date", endDate.format("YYYY-MM-DD"));
    formData.append("dates_are_approximate", String(datesAreApproximate));
    formData.append("prefers_same_gender", String(prefersSameGender));
    formData.append("description", description);
    if (images?.length) {
        for (const image of images) {
            formData.append("images", image);
        }
    }
    
    try {
        const response = await fetch("/api/listings", {
            method: "POST",
            body: formData
        });
        const data = await response.json();

        if (response.status === 207) {
            console.warn(data.data.message);
            console.warn(data.data.unsavedImages)
            return data.data.id;
        } else if (response.ok) {
            return data.data;
        }

        throw new Error(data.error);
    } catch (error) {
        console.error("Failed to create new listing:", error);
    }

    return null;
}

export async function getListingData(): Promise<ListingData[] | null>
export async function getListingData(listingId: number): Promise<ListingData | null>;
export async function getListingData(listingId?: number): Promise<ListingData | ListingData[] | null> {
    try {
        const response = await fetch(`/api/listings${ listingId ? "/" + listingId : "" }`, { method: "GET" });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        return data.data;
    } catch (error) {
        console.error(listingId ? `Error retrieving listing #${ listingId }:` : "Error retrieving user's listings:", error);
    }

    return null;
}

export async function deleteListing(listingId: number) {
    try {
        const response = await fetch(`/api/listings/${ listingId }`, { method: "DELETE" });

        if (response.ok) {
            return true;
        }

        const data = await response.json();

        throw new Error(data.error);
    } catch (error) {
        console.error(`Error deleting listing #${ listingId }:`, error);
    }

    return false;
}