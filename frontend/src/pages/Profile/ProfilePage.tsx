import { useState } from "react";

import { Autocomplete, Chip, Box, Button, TextField, Typography, Container } from "@mui/material";
import { Link } from "react-router-dom";

import ProfilePicture from "../../features/accounts/components/ProfilePicture";
import useUserContext from "../../features/auth/hooks/useUserContext";

export default function ProfilePage() {
    const user = useUserContext().user;
    const [bio, setBio] = useState("");
    const [interests, setInterests] = useState<string[]>([]);

    const interestOptions = [
        "Travel",
        "Cooking",
        "Reading",
        "Gaming",
        "Music",
        "Art",
        "Writing",
        "Photography",
        "Fitness",
        "Hiking",
        "Volunteering",
        "Machine Learning",
        "Data Science",
        "Design",
        "UX/UI",
        "Philosophy",
        "Psychology",
        "Chess"
    ];

    return (
        <Container maxWidth = "md">
            {/* { user?.userId ?
                <ProfilePicture userId = { user.userId } upload onUpload = { () => ("") } />
            :
                <ProfilePicture />
            } */}
            <ProfilePicture userId = { user?.userId } upload />
                
            <Typography variant = "h1">
                Full Name
            </Typography>

            <Box sx = {{ width: "60%", mx: "auto", textAlign: "left" }}>
                <TextField
                    fullWidth
                    label = "Bio"
                    multiline
                    rows = { 4 }
                    variant = "outlined"
                    margin = "normal"
                    value = { bio }
                    onChange = { (e) => setBio(e.target.value) }
                />

                <Autocomplete
                    multiple
                    freeSolo
                    options = { interestOptions }
                    value = { interests }
                    onChange = { (_, newValue) => setInterests(newValue) }
                    renderTags = { (value, getTagProps) =>
                        <Box sx = {{ display: "flex", flexWrap: "nowrap", overflowX: "scroll" }}>
                            { value.map((interest, index) => (
                                <Chip variant = "outlined" label = { interest } { ...getTagProps({ index }) } />
                            )).reverse() }
                        </Box>
                    }
                    renderInput = { (params) => (
                        <TextField
                            { ...params }
                            variant = "outlined"
                            label = "Interests"
                            placeholder = "Add interests"
                        />
                    )}
                    slotProps = {{
                        popper: {
                            modifiers: [
                                {
                                    name: "flip",
                                    enabled: false, // force dropdown below
                                },
                            ],
                        },
                        listbox: {
                            sx: { maxHeight: 250 }, // limit height of dropdown box
                        }
                    }}
                />
            </Box>

            <Button
                variant = "contained"
                sx = {{ mt: 2 }}
                onClick = { () => console.log("Saved!") }
            >
                Save Profile
            </Button>

            <Button
                component = { Link }
                to = "/listings"
                variant = "outlined"
                sx = {{ mt: 2 }}
            >
                Go to your listings
            </Button>
        </Container>
    );
}