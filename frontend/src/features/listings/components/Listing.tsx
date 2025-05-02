import { useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import { Box, Typography, TextField, Button, IconButton, Tooltip, ImageList, ImageListItem } from "@mui/material";

import UploadButton from "../../../components/UploadButton/UploadButton";

export default function Listing({ mode = "create", initialData }: { mode?: "create" | "view" | "edit", initialData?: { text: string, images: (File | string)[] } }) {
    const [text, setText] = useState(initialData?.text || "");
    const [uploadedImages, setUploadedImages] = useState<(File | string)[]>(initialData?.images || []);

    function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files ? Array.from(event.target.files) : [];
        if (!files.length) return;

        const combined = [...uploadedImages, ...files];

        if (combined.length > 5) {
            alert("You can upload a maximum of 5 images.");
            setUploadedImages(combined.slice(0, 5)); // Limit to 5
        } else {
            setUploadedImages(combined);
        }

        // Reset input so selecting the same file again still triggers onChange
        event.target.value = "";
    }

    function handleRemoveImage(index: number) {
        const updated = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(updated);
    }

    function handleSubmit() {
        // send 'text' and 'uploadedImages' to backend
        console.log("Submitting:", { text, uploadedImages });
    }

    const isEditable = mode === "create" || mode === "edit";

    return (
        <Box sx={{ width: "60%", margin: "2rem auto" }}>
            <Typography variant="h4" marginBottom="1rem">
            {mode === "view"
                ? "Your Listing"
                : mode === "edit"
                ? "Edit Your Listing"
                : "Create a New Listing"}
            </Typography>

            <TextField
                fullWidth
                label="I am looking for..."
                variant="outlined"
                margin="normal"
                value={text}
                onChange={isEditable ? (e) => setText(e.target.value) : undefined}
                disabled={!isEditable}
                inputProps={{ maxLength: 500 }}
            />
            <Typography variant="caption" color="textSecondary">
                {text.length} / 500 characters
            </Typography>

            {isEditable && (
                <Box marginTop="1rem" marginBottom="1rem">
                    <UploadButton
                        label={uploadedImages.length >= 5 ? "Image limit reached" : "Upload images"}
                        multiple={true}
                        inputProps={{
                            accept: "image/*",
                            multiple: true,
                            onChange: handleImageUpload,
                            disabled: uploadedImages.length >= 5  // Disable after 5 images
                        }}
                    />
                </Box>
            )}

            {isEditable ? (
                <Box marginTop="1rem" display="flex" flexWrap="wrap" gap={2}>
                    {uploadedImages.map((file, index) => {
                        const url = typeof file === "string" ? file : URL.createObjectURL(file);
                        return (
                            <Box
                                key={index}
                                sx={{
                                    width: "100px",
                                    textAlign: "center",
                                    position: "relative"
                                }}
                            >
                                <Box
                                    sx={{
                                        width: "100px",
                                        height: "100px",
                                        position: "relative",
                                        borderRadius: "8px",
                                        overflow: "visible"
                                    }}
                                >
                                    <img
                                        src={url}
                                        alt={`Uploaded ${index}`}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />

                                    <Tooltip title="Remove image">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveImage(index)}
                                            sx={{
                                                position: "absolute",
                                                top: -6,
                                                right: -6,
                                                width: 24,
                                                height: 24,
                                                padding: 0,
                                                backgroundColor: "white",
                                                color: "red",
                                                borderRadius: "50%",
                                                "&:hover": {
                                                    backgroundColor: "#ffe6e6",
                                                },
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <CloseIcon sx={{ fontSize: 18, fontWeight: "bold" }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                {typeof file !== "string" && (
                                    <Typography variant="body2" sx={{ mt: 0.5 }} noWrap>
                                        {file.name}
                                    </Typography>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            ) : (
                <ImageList variant="masonry" cols={3} gap={8}>
                    {uploadedImages.map((file, index) => {
                        const url = typeof file === "string" ? file : URL.createObjectURL(file);
                        return (
                            <ImageListItem key={index}>
                                <img
                                    src={`${url}?w=248&fit=crop&auto=format`}
                                    srcSet={`${url}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                    alt={`Uploaded image ${index + 1}`}
                                    loading="lazy"
                                />
                            </ImageListItem>
                        );
                    })}
                </ImageList>
            )}

            {isEditable && (
                <Button
                    variant="contained"
                    sx={{ marginTop: "2rem" }}
                    onClick={handleSubmit}
                >
                    Submit Listing
                </Button>
            )}
        </Box>
    );
}