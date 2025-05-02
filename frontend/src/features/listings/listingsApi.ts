import { Dayjs } from "dayjs";
import { LatLngLiteral } from "../maps/mapsConstants";
import { ListingCategory } from "./listingsConstants";

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

    console.log(formData);
    
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