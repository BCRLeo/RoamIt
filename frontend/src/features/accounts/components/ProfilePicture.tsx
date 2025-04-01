import { ChangeEvent, JSX, useEffect, useState } from "react";

import { PhotoCamera } from "@mui/icons-material";
import { Avatar, Badge, Box } from "@mui/material";

import UploadButton from "../../../components/UploadButton/UploadButton";
import { getProfilePictureUrl, getPublicUserDataFromId } from "../accountsApi";

export default function ProfilePicture({ userId }: { userId?: number }): JSX.Element;
export default function ProfilePicture({ userId, upload }: { userId: number, upload: false }): JSX.Element;
export default function ProfilePicture({ userId, upload, onUpload }: { userId: number, upload: true, onUpload?: ((event: ChangeEvent<HTMLInputElement>) => void) }): JSX.Element;
export default function ProfilePicture({ userId, upload, onUpload }: { userId?: number, upload?: boolean, onUpload?: ((event: ChangeEvent<HTMLInputElement>) => void) }): JSX.Element {
    // <ProfilePicture />
    if (userId === undefined && upload === undefined && onUpload === undefined) {
        return (
            <Box sx = {{ width: "8rem", height: "8rem", mx: "auto" }}>
                <Avatar sx = {{ width: "100%", height: "100%" }} />
            </Box>
        );
    }

    const [username, setUsername] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        if (!userId) {
            return;
        }

        (async () => {
            const response = await getPublicUserDataFromId(userId);
            if (response) {
                setUsername(response.username);
            }
        })();
    }, []);

    useEffect(() => {
        if (!userId) {
            return;
        }

        (async () => {
            const response = await getProfilePictureUrl(userId);
            if (response) {
                setImageUrl(response);
            }
        })();
    }, [userId]);

    // <ProfilePicture userId = { userId } /> and <ProfilePicture userId = { userId } upload = { false } />
    if ((upload === undefined || upload === false) && onUpload === undefined) {
        return (
            <Box sx = {{ width: "8rem", height: "8rem", mx: "auto" }}>
                <Avatar src = { imageUrl } alt = { username ?? undefined } sx = {{ width: "100%", height: "100%" }} />
            </Box>
        );
    }

    async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            const file = event.target.files[0];

            setImageUrl(URL.createObjectURL(file));
        }
    }

    // <ProfilePicture userId = { userId } upload />
    if (onUpload === undefined) {
        return (
            <Box width = "min-content" mx = "auto">
                <Badge
                    overlap = "circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent = {
                        <UploadButton icon = { <PhotoCamera /> } inputProps = {{ onChange: handleUpload, accept: "image/*" }} />
                    }
                    sx = {{ width: "8rem", height: "8rem" }}
                >
                    <Avatar src = { imageUrl } alt = { username ?? undefined } sx = {{ width: "100%", height: "100%" }} />
                </Badge>
            </Box>
        );
    }
    
    // <ProfilePicture userId = { userId } upload onUpload = { onUpload } />
    return (
        <Box width = "min-content" mx = "auto">
            <Badge
                overlap = "circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent = {
                    <UploadButton
                        icon = { <PhotoCamera /> }
                        inputProps = {{
                            onChange: (event) => {
                                handleUpload(event);
                                onUpload(event);
                            },
                            accept: "image/*"
                        }}
                    />
                }
                sx = {{ width: "8rem", height: "8rem" }}
            >
                <Avatar src = { imageUrl } alt = { username ?? undefined } sx = {{ width: "100%", height: "100%" }} />
            </Badge>
        </Box>
    );
}