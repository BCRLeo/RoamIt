import { useSuspenseQuery } from "@tanstack/react-query";
import { getListingData } from "../listingsApi";

export function useListingData(listingId?: number) {
    const { data } = useSuspenseQuery({
        queryKey: [`getListingData`, listingId],
        queryFn: async () => { 
            if (listingId === undefined) return null;

            const response = await getListingData(listingId);

            if (response.status === "error" || !response.data) {
                throw new Error("Failed to retrieve listing data.");
            };
            
            const listingData = response.data;
            
            return listingData;
        }
    });

    return data;
}