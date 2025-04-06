import { ChangeEvent, JSX, SyntheticEvent, useState } from "react";

import { AutocompleteChangeReason, Box, Button, Container, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";

import { deleteBio, deleteTags, uploadBio, uploadProfilePicture, uploadTags } from "../../features/accounts/accountsApi";
import Bio from "../../features/accounts/components/Bio";
import ProfilePicture from "../../features/accounts/components/ProfilePicture";
import Tags from "../../features/accounts/components/Tags";
import usePublicUserData from "../../features/accounts/hooks/usePublicUserData";
import useUnsavedStatus from "../../hooks/useUnsavedStatus";
import NotFoundPage from "../NotFound/NotFoundPage";
import { useToggleState } from "../../hooks/useToggleState";

export default function ProfilePage({ username = useParams()?.username }: { username?: string }): JSX.Element {
    if (!username) {
        return (
            <NotFoundPage />
        );
    }

    const { user, isAuthenticated } = usePublicUserData(username);
    const [isEditing, toggleIsEditing] = useToggleState(false, (isEditing) => {
        if (isEditing) {
            saveChanges();
        }
    });

    const [updatedProfilePicture, setUpdatedProfilePicture] = useState<File | null>(null);
    const [updatedBio, setUpdatedBio] = useState<string | null>(null);
    const [updatedTags, setUpdatedTags] = useState<string[] | null>(null);
    
    const isUnsaved = useUnsavedStatus([updatedProfilePicture, updatedBio, updatedTags]);

    async function handleUploadProfilePicture(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            setUpdatedProfilePicture(event.target.files[0]);
        }
    }

    async function saveChanges() {
        if (updatedProfilePicture) {
            const success = await uploadProfilePicture(updatedProfilePicture);
            
            if (success) {
                setUpdatedProfilePicture(null);
            }
        }

        if (updatedBio) {
            const success = await uploadBio(updatedBio);

            if (success) {
                setUpdatedBio(null);
            }
        } else if (updatedBio === "") {
            const success = await deleteBio();

            if (success) {
                setUpdatedBio(null);
            }
        }

        if (updatedTags?.length) {
            const success = await uploadTags(updatedTags);

            if (success) {
                setUpdatedTags(null);
            }
        } else if (updatedTags) {
            const success = await deleteTags();

            if (success) {
                setUpdatedTags(null);
            }
        }
    }

    async function handleUpdateTags(_event: SyntheticEvent, value: string[], _reason: AutocompleteChangeReason) {
        setUpdatedTags(value);
    }

    if (!user) {
        return (
            <NotFoundPage />
        );
    }

    if (!isAuthenticated) {
        return (
            <Container maxWidth = "md">
                <ProfilePicture userId = { user.userId } />
                    
                <Typography variant = "h1" marginBottom = { 0 }>
                    { `${ user.firstName + " " + user.lastName }` }
                </Typography>
                <Typography variant = "body1" marginTop = { 0 }>
                    @{ user.username }
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
            <ProfilePicture userId = { user.userId } onUpload = { isEditing ? handleUploadProfilePicture : undefined } />
                
            <Typography variant = "h1" marginBottom = { 0 }>
                { `${ user.firstName + " " + user.lastName }` }
            </Typography>
            <Typography variant = "body1" marginTop = { 0 }>
                @{ user.username }
            </Typography>

            <Box sx = {{ width: "60%", mx: "auto", textAlign: "left" }}>
                <Bio userId = { user.userId } onEdit = { isEditing ? (event) => setUpdatedBio(event.target.value) : undefined } />

                <Tags userId = { user.userId } onEdit = { isEditing ? handleUpdateTags : undefined } />
            </Box>

            <Box sx = {{ display: "flex", width: "fit-content", mt: "1rem", mx: "auto" }} gap = "1rem">
                { isEditing ?
                    <Button
                        variant = "contained"
                        onClick = { () => toggleIsEditing() }
                    >
                        { isUnsaved ? "Save changes" : "Finish editing" }
                    </Button>
                :
                    <Button
                        variant = "contained"
                        onClick = { () => toggleIsEditing() }
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