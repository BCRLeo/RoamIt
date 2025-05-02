const listingCategories = ["short-term", "long-term", "hosting"] as const;
export type ListingCategory = (typeof listingCategories)[number];

export function isListingCategory(value: string): value is ListingCategory {
    return (listingCategories as readonly string[]).includes(value);
}