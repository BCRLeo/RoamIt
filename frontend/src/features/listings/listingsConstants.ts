import { Dayjs } from "dayjs";
import { Location } from "../maps/mapsConstants";

const listingCategories = ["short-term", "long-term", "hosting"] as const;
export type ListingCategory = (typeof listingCategories)[number];

export function isListingCategory(value: string): value is ListingCategory {
    return (listingCategories as readonly string[]).includes(value);
}

export type ListingData = {
    id: number,
    userId: number,
    location: Location,
    radius: number,
    category: ListingCategory,
    nightlyBudget?: number,
    startDate: Dayjs,
    endDate?: Dayjs,
    datesAreApproximate: boolean,
    prefersSameGender: boolean,
    description: string,
    currency: string,
    isComplete: boolean,
    timestamp: Dayjs
}