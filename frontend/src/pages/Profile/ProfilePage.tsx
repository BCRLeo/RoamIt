import { ChangeEvent, JSX, useEffect, useState } from "react";

import { Box, Button, Typography, Container } from "@mui/material";
import { Link, useParams } from "react-router-dom";

import { getPublicUserDataFromUsername, uploadBio, uploadProfilePicture, uploadTags } from "../../features/accounts/accountsApi";
import ProfilePicture from "../../features/accounts/components/ProfilePicture";
import { PublicUserData } from "../../features/auth/authApi";
import useUserContext from "../../features/auth/hooks/useUserContext";
import NotFoundPage from "../NotFound/NotFoundPage";
import Bio from "../../features/accounts/components/Bio";
import Tags from "../../features/accounts/components/Tags";

export default function ProfilePage({ username = useParams()?.username }: { username?: string }): JSX.Element {
    if (!username) {
        return (
            <NotFoundPage />
        );
    }

    const currentUser = useUserContext().user;
    const [user, setUser] = useState<PublicUserData | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        (async () => {
            const response = await getPublicUserDataFromUsername(username);
            
            if (!response) {
                setIsNotFound(true);
                return;
            }
            setUser(response);

            if (currentUser && response.userId == currentUser.userId) {
                setIsAuthenticated(true);
            }
        })();
    }, [currentUser]);

    const [unsavedProfilePicture, setUnsavedProfilePicture] = useState<File | null>(null);
    const [unsavedBio, setUnsavedBio] = useState("");
    const [unsavedTags, setUnsavedTags] = useState<string[]>([]);
    const [isUnsaved, setIsUnsaved] = useState(false);

    useEffect(() => {
        if (unsavedProfilePicture || unsavedBio || unsavedTags.length) {
            setIsUnsaved(true);
            return;
        }
        setIsUnsaved(false);
    }, [unsavedBio, unsavedProfilePicture, unsavedTags]);

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
            } else {
                setUnsavedProfilePicture(null);
            }
        }

        if (unsavedBio) {
            const success = await uploadBio(unsavedBio);

            if (!success) {
                console.error("Failed to save bio.");
            } else {
                setUnsavedBio("");
            }
        }

        if (unsavedTags.length) {
            console.log(unsavedTags)
            const success = await uploadTags(unsavedTags);

            if (!success) {
                console.error("Failed to save tags.")
            } else {
                setUnsavedTags([]);
            }
        }
    }

    async function handleToggleEdit() {
        if (isEditing) {
            handleSave();
        }

        setIsEditing((isEditing) => !isEditing);
    }

    if (!user && isNotFound) {
        return (
            <NotFoundPage />
        );
    } else if (!user) {
        return (
            <NotFoundPage /> // replace with something that throws suspense or something in the future
        );
    }

    if (!isAuthenticated) {
        return (
            <Container maxWidth = "md">
                <ProfilePicture userId = { user.userId } />
                    
                <Typography variant = "h1">
                    { `${user.firstName} ${user.lastName}` }
                </Typography>

                <Box sx = {{ width: "60%", mx: "auto", textAlign: "left" }}>
                    <Bio userId = { user.userId } />

                    <Tags userId = { user.userId } />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth = "md">
            <ProfilePicture userId = { user.userId } onUpload = { isEditing ? handleUpload : undefined } />
                
            <Typography variant = "h1">
                { `${user.firstName} ${user.lastName}` }
            </Typography>

            <Box sx = {{ width: "60%", mx: "auto", textAlign: "left" }}>
                <Bio userId = { user.userId } onEdit = { isEditing ? (event) => setUnsavedBio(event.target.value) : undefined } />

                <Tags userId = { user.userId } onEdit = { isEditing ? setUnsavedTags : undefined } />
            </Box>

            <Box sx = {{ display: "flex", width: "fit-content", mt: "1rem", mx: "auto" }} gap = "1rem">
                { isEditing ?
                    <Button
                        variant = "contained"
                        onClick = { handleToggleEdit }
                    >
                        { isUnsaved ? "Finish editing" : "Save changes" }
                    </Button>
                :
                    <Button
                        variant = "contained"
                        onClick = { handleToggleEdit }
                    >
                        Edit profile
                    </Button>
                }
                    

                <Button
                    component = { Link }
                    to = "/listings"
                    variant = "outlined"
                >
                    Go to your listings
                </Button>
            </Box>
        </Container>
    );
}