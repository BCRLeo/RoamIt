import { ApiResult } from "../../constants";

export async function getListingRecommendations(listingId: number): Promise<ApiResult<number[]>> {
    try {
        const response = await fetch(`/api/listings/${ listingId }/recommendations`, { method: "GET" });

        if (response.status === 204) {
            return { status: "success", data: null };
        }
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        return { status: "success", data: data.data };
    } catch (error) {
        console.log(`Error retrieving listing #${ listingId }'s listing recommendations:`, error);
        return { status: "error", message: String(error) };
    }
}