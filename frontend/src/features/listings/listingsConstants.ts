import { Dayjs } from "dayjs";
import { Location } from "../maps/mapsConstants";

export const LISTING_TAG_OPTIONS = [
    "Art",
    "Group",
    "Hiking",
    "Looking for group",
    "Looking for solo",
    "Movies",
    "Solo",
    "Surfing",
    "Wine"
] as const;

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

export type ListingViewMode = "full" | "preview" | "list";