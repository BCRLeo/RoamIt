import { ChangeEvent, JSX, useEffect, useState } from "react";

import { Autocomplete, Chip, Box, Button, TextField, Typography, Container } from "@mui/material";
import { Link, useParams } from "react-router-dom";

import { getPublicUserDataFromUsername, uploadProfilePicture } from "../../features/accounts/accountsApi";
import ProfilePicture from "../../features/accounts/components/ProfilePicture";
import { PublicUserData } from "../../features/auth/authApi";
import useUserContext from "../../features/auth/hooks/useUserContext";
import NotFoundPage from "../NotFound/NotFoundPage";

export default function ProfilePage({ username = useParams()?.username }: { username?: string }): JSX.Element {
    if (!username) {
        return (
            <NotFoundPage />
        );
    }

    const currentUser = useUserContext().user;
    const [user, setUser] = useState<PublicUserData | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        (async () => {
            const response = await getPublicUserDataFromUsername(username);
            
            if (!response) {
                return;
            }
            setUser(response);

            if (currentUser && response.userId == currentUser.userId) {
                setIsAuthenticated(true);
            }
        })();
    }, [currentUser]);

    const [unsavedProfilePicture, setUnsavedProfilePicture] = useState<File | null>(null);
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

    if (!user) {
        return (
            <Typography variant = "h1">Loading...</Typography>
        );
    }

    async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            setUnsavedProfilePicture(event.target.files[0]);
        }
    }

    async function handleSave() {
        if (unsavedProfilePicture) {
            const success = await uploadProfilePicture(unsavedProfilePicture);
            
            if (!success) {
                console.error("Failed to save profile picture.");
            }

            setUnsavedProfilePicture(null);
        }
    }

    return (
        <Container maxWidth = "md">
            { isAuthenticated ?
                <ProfilePicture userId = { user.userId } upload onUpload = { handleUpload } />
            :
                <ProfilePicture userId = { user.userId } />
            }
                
            <Typography variant = "h1">
                { `${user.firstName} ${user.lastName}` }
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
            
            { isAuthenticated &&
                <Box sx = {{ display: "flex", width: "fit-content", mt: "1rem", mx: "auto" }} gap = "1rem">
                    <Button
                        variant = "contained"
                        onClick = { handleSave }
                        disabled = { unsavedProfilePicture === null }
                    >
                        Save changes
                    </Button>

                    <Button
                        component = { Link }
                        to = "/listings"
                        variant = "outlined"
                    >
                        Go to your listings
                    </Button>
                </Box>
            }
        </Container>
    );
}