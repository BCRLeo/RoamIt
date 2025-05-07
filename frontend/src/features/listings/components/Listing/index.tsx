import { Box, AutocompleteChangeReason, Button, Stack, StackProps } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import { NavLink } from "react-router";

import { deleteListingTags, getListingData, uploadListingTags } from "../../listingsApi";
import usePublicUserData from "../../../accounts/hooks/usePublicUserData";
import { Children, cloneElement, isValidElement, ReactNode, SyntheticEvent, useState } from "react";
import useUnsavedStatus from "../../../../hooks/useUnsavedStatus";
import { useToggleState } from "../../../../hooks/useToggleState";
import Name from "./Name";
import CategoryAndDates from "./CategoryAndDates";
import Budget from "./Budget";
import GenderPreference from "./GenderPreference";
import Location from "./Location";
import Category from "./Category";
import Dates from "./Dates";
import Description from "./Description";
import Profile from "./Profile";
import Tags from "./Tags";
import Images from "./Images";
import { ListingData } from "../../listingsConstants";

Listing.Budget = Budget;
Listing.Category = Category;
Listing.CategoryAndDates = CategoryAndDates;
Listing.Dates = Dates;
Listing.Description = Description;
Listing.GenderPreference = GenderPreference;
Listing.Images = Images;
Listing.Location = Location;
Listing.Name = Name;
Listing.Profile = Profile;
Listing.Tags = Tags;

export default function Listing({ children, listingId, editable = true, stackProps }: { children?: ReactNode, listingId: number, editable?: boolean, stackProps?: StackProps }) {
    const { sx: stackPropsSx = {}, ...stackPropsRest } = stackProps ?? {};

    const { data: listingData } = useSuspenseQuery({
        queryKey: [`getListingData`, listingId],
        queryFn: async () => { 
            const response = await getListingData(listingId);

            if (response.status === "error" || !response.data) {
                throw new Error("Failed to retrieve listing data.");
            };
            
            const listingData = response.data;
            
            return listingData;
        }
    });
    const { isAuthenticated } = usePublicUserData(listingData.userId);

    const [isEditing, toggleIsEditing] = useToggleState(false, (isEditing) => {
        if (isEditing) {
            saveChanges();
        }
    });

    const [updatedTags, setUpdatedTags] = useState<string[] | null>(null);
    const isUnsaved = useUnsavedStatus([updatedTags]);

    function handleUpdateTags(_event: SyntheticEvent, value: string[], _reason: AutocompleteChangeReason) {
        setUpdatedTags(value);
    }

    async function saveChanges() {
        if (updatedTags?.length) {
            const result = await uploadListingTags(listingId, updatedTags);

            if (result.status === "success") {
                setUpdatedTags(null);
            }
        } else if (updatedTags) {
            const result = await deleteListingTags(listingId);

            if (result.status === "success") {
                setUpdatedTags(null)
            }
        }
    }

    if (Children.count(children) == 0) {
        if (isAuthenticated) return (
            <Stack
                spacing = { 2 }
                sx = {{
                    width: "55%",
                    margin: "2rem auto",
                    alignItems: "center",
                    ...stackPropsSx
                }}
                { ...stackPropsRest }
            >
                <Name listingData = { listingData } />
                <CategoryAndDates listingData = { listingData } />
                <Budget listingData = { listingData } />
                <GenderPreference listingData = { listingData } />

                <Tags listingData = { listingData } onEdit = { isEditing ? handleUpdateTags : undefined } />
                <Location listingData = { listingData } />
                <Description listingData = { listingData } />
                <Images listingData = { listingData } />

                { editable && (
                    <Box
                        sx = {{
                            display: "flex",
                            width: "fit-content",
                            mt: "1rem",
                            mx: "auto"
                        }}
                        gap = "1rem">
                        { isEditing ?
                            <Button
                                variant = "contained"
                                onClick = { toggleIsEditing }
                            >
                                { isUnsaved ? "Save changes" : "Finish editing" }
                            </Button>
                        :
                            <Button
                                variant = "contained"
                                onClick = { toggleIsEditing }
                            >
                                Edit listing
                            </Button>
                        }
                        <Button
                            component = { NavLink }
                            to = "/listings"
                            variant = "outlined"
                        >
                            Back to your listings
                        </Button>
                    </Box>
                )}
            </Stack>
        );
    
        return (
            <Stack
                spacing = { 2 }
                sx = {{
                    width: "55%",
                    margin: "2rem auto",
                    alignItems: "center",
                    ...stackPropsSx
                }}
                { ...stackPropsRest }
            >
                <Profile listingData = { listingData } />
                <Dates listingData = { listingData } />
                <Budget listingData = { listingData } />
                <GenderPreference listingData = { listingData } />
    
                <Tags listingData = { listingData } />
                <Location listingData = { listingData } />
                <Description listingData = { listingData } />
                <Images listingData = { listingData } />
            </Stack>
        );
    }

    const childrenWithProps = Children.map(children, child => {
        if (isValidElement<{ listingData: ListingData, [key: string]: any }>(child)) {
            return cloneElement(child, { listingData: listingData });
        }
        return child;
    });

    if (isAuthenticated) return (
        <Stack
            spacing = { 2 }
            sx = {{
                width: "55%",
                margin: "2rem auto",
                alignItems: "center",
                ...stackPropsSx
            }}
            { ...stackPropsRest }
        >
            { childrenWithProps }

            { editable && (
                <Box sx = {{ display: "flex", width: "fit-content", mt: "1rem", mx: "auto" }} gap = "1rem">
                    { isEditing ?
                        <Button
                            variant = "contained"
                            onClick = { toggleIsEditing }
                        >
                            { isUnsaved ? "Save changes" : "Finish editing" }
                        </Button>
                    :
                        <Button
                            variant = "contained"
                            onClick = { toggleIsEditing }
                        >
                            Edit listing
                        </Button>
                    }
                    <Button
                        component = { NavLink }
                        to = "/listings"
                        variant = "outlined"
                    >
                        Back to your listings
                    </Button>
                </Box>
            )}
        </Stack>
    );

    return (
        <Stack
            spacing = { 2 }
            sx = {{
                width: "55%",
                margin: "2rem auto",
                alignItems: "center",
                ...stackPropsSx
            }}
            { ...stackPropsRest }
        >
            <Profile listingData = { listingData } />
            <Dates listingData = { listingData } />
            <Budget listingData = { listingData } />
            <GenderPreference listingData = { listingData } />

            <Tags listingData = { listingData } />
            <Location listingData = { listingData } />
            <Description listingData = { listingData } />
            <Images listingData = { listingData } />
        </Stack>
    );
}