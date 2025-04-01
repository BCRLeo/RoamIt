import { ChangeEvent, JSX, useEffect, useState } from "react";

import { PhotoCamera } from "@mui/icons-material";
import { Avatar, Badge, Box } from "@mui/material";

import UploadButton from "../../../components/UploadButton/UploadButton";
import useUserContext from "../../auth/hooks/useUserContext";
import { getProfilePictureUrl, getPublicUserDataFromId, uploadProfilePicture } from "../accountsApi";

export default function ProfilePicture({ userId = useUserContext().user?.userId, upload = false }: { userId?: number | null, upload?: boolean, onUpload?: ((event: ChangeEvent<HTMLInputElement>) => void) }): JSX.Element {
    const [username, setUsername] = useState("");
    const [image, setImage] = useState<File | null>();
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
    }, [image, userId]);

    if (!upload) {
        return (
            <Box sx = {{ width: "8rem", height: "8rem", mx: "auto" }}>
                <Avatar src = { imageUrl } alt = { username ?? undefined } sx = {{ width: "100%", height: "100%" }} />
            </Box>
        );
    }

    async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            const file = event.target.files[0];
            const success = await uploadProfilePicture(file);

            if (!success) {
                return;
            }

            setImage(file);
            setImageUrl(URL.createObjectURL(file));
        }
    }
    
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