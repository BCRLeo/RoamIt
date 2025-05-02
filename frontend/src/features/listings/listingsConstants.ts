const listingCategories = ["Short-term", "Long-term", "Hosting"] as const;
export type ListingCategory = (typeof listingCategories)[number];

export function isListingCategory(value: string): value is ListingCategory {
    return (listingCategories as readonly string[]).includes(value);
}