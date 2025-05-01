import { ChangeEvent, ChangeEventHandler, useState } from "react";

import { PhotoCamera } from "@mui/icons-material";
import { Avatar, Badge, Box } from "@mui/material";
import { useSuspenseQueries } from "@tanstack/react-query";

import UploadButton from "../../../components/UploadButton/UploadButton";
import { Size } from "../../../constants";
import { getProfilePictureUrl, getUserData } from "../accountsApi";

export default function ProfilePicture(props:
    { userId?: number, size?: Size } |
    { userId: number, onUpload: ChangeEventHandler<HTMLInputElement>, size?: Size }
) {
    const userId = props.userId;
    const size = props.size;

    const sizeMap: Record<Size, string> = {
        xs: "1rem",
        sm: "2rem",
        md: "4rem",
        lg: "8rem"
    }
    const length = size ? sizeMap[size] : sizeMap["sm"];

    // <ProfilePicture />
    if (userId === undefined) {
        return (
            <Box sx = {{ width: length, height: length, mx: "auto" }}>
                <Avatar sx = {{ width: "100%", height: "100%" }} />
            </Box>
        );
    }

    const [{ data: user }, { data: profilePictureUrl }] = useSuspenseQueries({
        queries: [
            {
                queryKey: ["username", userId],
                queryFn: () => getUserData(userId, true)
            },
            {
                queryKey: ["profilePictureUrl", userId],
                queryFn: () => getProfilePictureUrl(userId)
            }
        ]
    })

    const username = user?.username;
    const [imageUrl, setImageUrl] = useState(profilePictureUrl);

    async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            const file = event.target.files[0];

            setImageUrl(URL.createObjectURL(file));
        }

        if ("onUpload" in props && props.onUpload !== undefined) {
            props.onUpload(event);
        }
    }

    // <ProfilePicture userId = { userId } /> and <ProfilePicture userId = { userId } onUpload = { undefined } />
    if (!("onUpload" in props) || props.onUpload === undefined) {
        return (
            <Box sx = {{ width: length, height: length, mx: "auto" }}>
                <Avatar
                    src = { imageUrl ?? undefined }
                    alt = { username ?? undefined }
                    title = { username ?? undefined }
                    sx = {{ width: "100%", height: "100%" }}
                />
            </Box>
        );
    }

    // <ProfilePicture userId = { userId } onUpload = { onUpload } />
    return (
        <Box width = "min-content" mx = "auto">
            <Badge
                overlap = "circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent = {
                    <UploadButton icon = { <PhotoCamera /> } inputProps = {{ onChange: handleUpload, accept: "image/*" }} />
                }
                sx = {{ width: length, height: length }}
            >
                <Avatar
                    src = { imageUrl ?? undefined }
                    alt = { username ?? undefined }
                    title = { username ?? undefined }
                    sx = {{ width: "100%", height: "100%" }}
                />
            </Badge>
        </Box>
    );
}