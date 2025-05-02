import { ChangeEvent, FormEvent, useState } from "react";

import { Close, Upload } from "@mui/icons-material";
import { TextField, Badge, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Grid2, FormControlLabel, Checkbox, ImageList, ImageListItem, IconButton, Grid2Props, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

import { isListingCategory, ListingCategory } from "../listingsConstants";
import { Place } from "../../maps/mapsConstants";
import UploadButton from "../../../components/UploadButton/UploadButton";
import LocationPicker from "../../maps/components/LocationPicker";
import { useToggleState } from "../../../hooks/useToggleState";
import { createListing } from "../listingsApi";

export default function ListingForm({ gridProps }: { gridProps?: Grid2Props}) {
    const { sx: gridPropsSx = {}, ...gridPropsRest } = gridProps || {};

    const [place, setPlace] = useState<Place | null>(null);
    const [radius, setRadius] = useState<number | null>(null);
    const [locationName, setLocationName] = useState("");
    const [category, setCategory] = useState<ListingCategory | null>(null);
    const [budget, setBudget] = useState<number | null>(null);
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [datesAreApproximate, toggleDatesAreApproximate] = useToggleState(false);
    const [prefersSameGender, togglePrefersSameGender] = useToggleState(false);
    const [description, setDescription] = useState("");
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);

    function handleLocationChange(place: Place | null, radius: number | null) {
        if (place) {
            setPlace(place);
        }

        if (radius) {
            setRadius(radius);
        }
    }

    function handleLocationNameChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const value = event.target.value;

        if (value.length <= 30) {
            setLocationName(value);
        }
    }

    function handleCategorySelection(event: SelectChangeEvent<ListingCategory | null>) {
        const value = event.target.value;

        if (!value || !isListingCategory(value)) {
            setCategory(null);
            return;
        }

        setCategory(value);
    }

    function handleBudgetChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const value = event.target.value;
        if (!value) {
            setBudget(null);
        }

        if (/^\d+$/.test(value) && Number(value) > 0) {
            setBudget(Math.trunc(Number(value)));
        } else {
            setBudget(null);
        }
    }

    function handleStartDateChange(value: Dayjs | null) {
        if (!value || !value.isValid()) {
            setStartDate(null);
            return;
        }

        setStartDate(value);
    }

    function handleEndDateChange(value: Dayjs | null) {
        if (!value || !value.isValid()) {
            setEndDate(null);
            return;
        }

        setEndDate(value);
    }

    function handleDescriptionChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const value = event.target.value;

        setDescription(value);
    }


    function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
        const files = event.target.files ? Array.from(event.target.files) : [];

        if (!files.length) return;

        const combined = Array.from(
            new Map([...uploadedImages, ...files].map(file => [file.name, file])).values()
        );

        if (combined.length > 5) {
            console.warn("You can upload a maximum of 5 images.");
            setUploadedImages(combined.slice(0, 5));
        } else {
            setUploadedImages(combined);
        }

        event.target.value = "";
    }

    function handleRemoveImage(index: number) {
        const updated = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(updated);
    }

    async function handleSubmit(event: FormEvent<HTMLButtonElement>) {
        event.preventDefault();
        //console.log("Submitting", { location, locationName, category, budget, startDate, endDate, datesAreApproximate, prefersSameGender, description, uploadedImages });

        if (!place || radius === null || category === null || !startDate || !description.trim()) {
            console.error("Incomplete form.");
            return;
        }

        await createListing({
            coordinates: place.coordinates,
            radius: radius,
            locationName: locationName,
            category: category,
            nightlyBudget: budget ?? undefined,
            startDate: startDate,
            endDate: endDate ?? undefined,
            datesAreApproximate: datesAreApproximate,
            prefersSameGender: prefersSameGender,
            description: description.trim(),
            images: uploadedImages
        })
    }

    return (
        <>
            <Typography variant = "h2" pb = "1rem">Create Listing</Typography>
            <Grid2
                container
                component = "form"
                spacing = { 2 }
                noValidate
                sx = {{
                    width: "55%",
                    margin: "2rem auto",
                    ...gridPropsSx
                }}
                { ...gridPropsRest }
            >
                <Grid2 size = { 12 }>
                    <LocationPicker
                        onChange = { handleLocationChange }
                        containerProps = {{
                            sx: {
                                width: "100%",
                                marginX: 0
                            }
                        }}
                    />
                </Grid2>

                <Grid2 size = { 12 }>
                    <TextField
                        label = "Custom Location Name"
                        value = { locationName }
                        onChange = { handleLocationNameChange }
                        sx = {{
                            width: "40%"
                        }}
                    />
                </Grid2>

                <Grid2 size = { 6 }>
                    <FormControl fullWidth required>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value = { category }
                            label = "Category"
                            onChange = { handleCategorySelection }
                            sx = {{ textAlign: "left"}}
                        >
                            <MenuItem disabled selected>-- Select an listing category --</MenuItem>
                            <MenuItem value = { "short-term" }>Short-term</MenuItem>
                            <MenuItem value = { "long-term" }>Long-term</MenuItem>
                            <MenuItem value = { "hosting" }>Hosting</MenuItem>
                        </Select>
                    </FormControl>
                </Grid2>
                <Grid2 size = { 6 }>
                    <FormControl fullWidth>
                        <TextField
                            label = "Nightly Budget"
                            value = { budget }
                            onChange = { handleBudgetChange }
                        />
                    </FormControl>
                </Grid2>
                
                <Grid2 size = { 3 }>
                    <DatePicker
                        label = "Start Date"
                        minDate = { dayjs() }
                        onChange = { handleStartDateChange }
                        value = { startDate }
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                required: true
                            }
                        }}
                    />
                </Grid2>
                <Grid2 size = { 3 }>
                    <DatePicker
                        label = "End Date"
                        minDate = { startDate?.add(1, "day") ?? dayjs().add(1, "day") }
                        onChange = { handleEndDateChange }
                        value = { endDate }
                        slotProps={{
                            textField: {
                                fullWidth: true
                            }
                        }}
                    />
                </Grid2>
                <Grid2 size = { 3 }>
                    <FormControlLabel
                        value = { datesAreApproximate }
                        control = { <Checkbox size = "medium" onChange = { toggleDatesAreApproximate } /> }
                        label = "Flexible Dates"
                        sx = {{ height: "100%", width: "100%", margin: "auto" }}
                    />
                </Grid2>
                <Grid2 size = { 3 }>
                    <FormControlLabel
                        value = { prefersSameGender }
                        control = { <Checkbox size = "medium" onChange = { togglePrefersSameGender } /> }
                        label = "Same Gender"
                        sx = {{ height: "100%", width: "100%", margin: "auto" }}
                    />
                </Grid2>

                <Grid2 size = { 12 }>
                    <TextField
                        label = "Description"
                        value = { description }
                        onChange = { handleDescriptionChange }
                        fullWidth
                        multiline
                        required
                    />
                </Grid2>

                <Grid2 size = { 12 }>
                    <UploadButton
                        icon = { <Upload /> }
                        label = "Upload images"
                        multiple
                        inputProps = {{
                            accept: "image/*",
                            multiple: true,
                            onChange: handleImageUpload,
                            disabled: uploadedImages.length >= 5
                        }}
                    />
                    { !!uploadedImages.length &&
                        <ImageList
                        variant = "masonry"
                        cols = { 3 }
                        gap = { 8 }
                        sx = {{
                            height: "30dvh",
                            display: "flex",
                            overflowX: "auto",
                            overflowY: "hidden",
                            whiteSpace: "nowrap",
                            gap: 2
                        }}
                    >
                        { uploadedImages.map((file, index) => {
                            const url = URL.createObjectURL(file);
                            return (
                                <ImageListItem key = { `${index}_${file.name}` } sx = {{ height: "100%" }}>
                                    <Badge
                                        overlap = "circular"
                                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                        badgeContent = {
                                            <IconButton
                                                size = "small"
                                                onClick = { () => handleRemoveImage(index) }
                                                sx = { (theme) => ({
                                                    backgroundColor: theme.palette.background.default,
                                                    color: "red",
                                                    borderRadius: "50%",
                                                    "&:hover": {
                                                        backgroundColor: "#ffe6e6",
                                                    },
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                })}
                                            >
                                                <Close sx={{ fontSize: 18, fontWeight: "bold" }} />
                                            </IconButton>
                                        }
                                        sx = {{ width: length, height: length }}
                                    >
                                        <img
                                            src = { url }
                                            style = {{
                                                height: "100%",
                                                objectFit: "contain",
                                                borderRadius: "8px"
                                            }}
                                        />
                                    </Badge>
                                </ImageListItem>
                            );
                        })}
                    </ImageList>
                    }
                </Grid2>

                { /* tags */ }

                <Grid2 size = { 12 }>
                    <Button variant = "contained" type = "submit" onClick = { handleSubmit }>
                        Create Listing
                    </Button>
                </Grid2>
            </Grid2>
        </>
    );
}