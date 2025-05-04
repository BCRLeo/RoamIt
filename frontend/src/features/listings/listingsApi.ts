import dayjs, { Dayjs } from "dayjs";
import { LatLngLiteral } from "../maps/mapsConstants";
import { ListingCategory, ListingData } from "./listingsConstants";
import { ApiResult } from "../../constants";

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

export async function getUserListingData(userIdOrUsername: number | string): Promise<ApiResult<ListingData[]>> {
    const possessiveUser = typeof(userIdOrUsername) === "number" ? `user #${ userIdOrUsername }` : "@" + userIdOrUsername;
    const urlUser = typeof(userIdOrUsername) === "number" ? userIdOrUsername : "@" + userIdOrUsername;

    try {
        const response = await fetch (`/api/users/${ urlUser }/listings`, { method: "GET" });

        if (response.status === 204) {
            return { status: "success", data: null };
        }

        const data = await response.json()

        if (response.ok) {
            return { status: "success", data: data.data };
        }

        throw new Error(data.error);
    } catch (error) {
        console.error(`Error retrieving ${ possessiveUser }'s listings:`, error);
        return { status: "error", message: String(error) };
    }
}

export async function getListingData(): Promise<ApiResult<ListingData[]>>
export async function getListingData(listingId: number): Promise<ApiResult<ListingData>>;
export async function getListingData(listingId?: number): Promise<ApiResult<ListingData> | ApiResult<ListingData[]>> {
    try {
        const response = await fetch(`/api/listings${ listingId ? "/" + listingId : "" }`, { method: "GET" });

        if (response.status === 204) {
            return { status: "success", data: null };
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }
        
        if (listingId !== undefined) {
            data.data.startDate = dayjs(data.data.startDate);

            if (data.data.endDate) {
                data.data.endDate = dayjs(data.data.endDate);
            }

            return { status: "success", data: data.data };
        }

        for (const listing of data.data) {
            listing.startDate = dayjs(listing.startDate);
            if (listing.endDate) {
                listing.endDate = dayjs(listing.endDate);
            }
        }

        return { status: "success", data: data.data };
    } catch (error) {
        console.error(listingId ? `Error retrieving listing #${ listingId }:` : "Error retrieving user's listings:", error);
        return { status: "error", message: String(error) };
    }
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

/**
 * Get the image blob of the ListingPicture associated to `listingPictureId`.
 */
export async function getListingPicture(listingPictureId: number): Promise<ApiResult<Blob>> {
    try {
        const response = await fetch(`/api/listings/pictures/${ listingPictureId }`, { method: "GET" });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }

        const image = await response.blob();

        return { status: "success", data: image };
    } catch (error) {
        console.error(`Error retrieving listing picture #${ listingPictureId }:`, error);
        return { status: "error", message: String(error) };
    }
}

/**
 * Get the IDs of all the ListingPictures associated to listing #`listingId`.
 */
export async function getListingPictureIds(listingId: number): Promise<ApiResult<number[]>> {
    try {
        const response = await fetch(`/api/listings/${ listingId }/pictures/ids`);

        if (response.status === 204) {
            return { status: "success", data: null };
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        return { status: "success", data: data.data };
    } catch (error) {
        console.error(`Error retrieving listing #${ listingId }'s picture IDs:`, error);
        return { status: "error", message: String(error) };
    }
}

export async function getListingPictures(listingId: number): Promise<ApiResult<Blob[]>> {
    try {
        const idsResponse = await getListingPictureIds(listingId);

        if (idsResponse.status === "error") {
            throw new Error(idsResponse.message);
        }

        const ids = idsResponse.data;

        if (!ids) {
            return { status: "success", data: null };
        }

        const pictures: Blob[] = [];

        for (const id of ids) {
            const pictureResponse = await getListingPicture(id);

            if (pictureResponse.status === "success" && pictureResponse.data) {
                pictures.push(pictureResponse.data);
            } else {
                console.error(`Failed to retrieve listing picture #${ id }.`);
            }
        }

        if (!pictures.length) {
            return { status: "success", data: null };
        }

        return { status: "success", data: pictures };
    } catch (error) {
        console.error(`Error retrieving listing #${ listingId }'s pictures:`, error);
        return { status: "error", message: String(error) };
    }
}