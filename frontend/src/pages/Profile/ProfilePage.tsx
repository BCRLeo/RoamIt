import { ChangeEvent, JSX, useEffect, useState } from "react";

import { AutocompleteChangeReason, Box, Button, Container, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";

import { deleteBio, deleteTags, getPublicUserDataFromUsername, uploadBio, uploadProfilePicture, uploadTags } from "../../features/accounts/accountsApi";
import Bio from "../../features/accounts/components/Bio";
import ProfilePicture from "../../features/accounts/components/ProfilePicture";
import Tags from "../../features/accounts/components/Tags";
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

    type TagChanges = {
        add: string[],
        remove: string[],
        clear: boolean
    };

    const [unsavedProfilePicture, setUnsavedProfilePicture] = useState<File | null>(null);
    const [unsavedBio, setUnsavedBio] = useState<string | null>(null);
    const [tagChanges, setTagChanges] = useState<TagChanges>({ add: [], remove: [], clear: false });
    const [isUnsaved, setIsUnsaved] = useState(false);

    useEffect(() => {
        if (unsavedProfilePicture || unsavedBio !== null || tagChanges.add.length || tagChanges.remove.length || tagChanges.clear) {
            setIsUnsaved(true);
            return;
        }
        
        setIsUnsaved(false);
    }, [unsavedBio, unsavedProfilePicture, tagChanges]);

    async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            setUnsavedProfilePicture(event.target.files[0]);
        }
    }

    async function handleSave() {
        if (unsavedProfilePicture) {
            const success = await uploadProfilePicture(unsavedProfilePicture);
            
            if (success) {
                setUnsavedProfilePicture(null);
            }
        }

        if (unsavedBio) {
            const success = await uploadBio(unsavedBio);

            if (success) {
                setUnsavedBio(null);
            }
        } else if (unsavedBio === "") {
            const success = await deleteBio();

            if (success) {
                setUnsavedBio(null);
            }
        }

        if (tagChanges.clear) {
            const success = await deleteTags();

            if (success) {
                setTagChanges((prev) => ({
                    add: prev.add,
                    remove: prev.remove,
                    clear: false
                }));
            }
        }

        if (tagChanges.add.length) {
            const success = await uploadTags(tagChanges.add);

            if (success) {
                setTagChanges((prev) => ({
                    add: [],
                    remove: prev.remove,
                    clear: false
                }));
            }
        }

        if (tagChanges.remove.length) {
            const success = await deleteTags(tagChanges.remove);

            if (success) {
                setTagChanges((prev) => ({
                    add: prev.add,
                    remove: [],
                    clear: false
                }));
            }
        }
    }

    async function handleChangeTags(value: string[], reason: AutocompleteChangeReason) {
        const add = new Set(tagChanges.add);
        const remove = new Set(tagChanges.remove);
        let clear = tagChanges.clear;
        
        switch (reason){
            case "createOption":
                value.forEach((tag) => add.add(tag));
                break;
            case "selectOption":
                value.forEach((tag) => add.add(tag));
                break;
            case "removeOption":
                value.forEach((tag) => remove.add(tag));
                break;
            case "clear":
                add.clear();
                remove.clear();
                clear = true;
                break;
        }

        add.forEach((tag) => {
            if (remove.has(tag)) {
                add.delete(tag);
                remove.delete(tag);
            }
        });

        setTagChanges({
            add: Array.from(add),
            remove: Array.from(remove),
            clear: clear
        });
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

                <Tags userId = { user.userId } onEdit = { isEditing ? (_, value, reason) => handleChangeTags(value, reason) : undefined } />
            </Box>

            <Box sx = {{ display: "flex", width: "fit-content", mt: "1rem", mx: "auto" }} gap = "1rem">
                { isEditing ?
                    <Button
                        variant = "contained"
                        onClick = { handleToggleEdit }
                    >
                        { isUnsaved ? "Save changes" : "Finish editing" }
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