import {
    Box,
    IconButton,
    Typography,
  } from "@mui/material";
  import UploadFileIcon from "@mui/icons-material/UploadFile";
  import DeleteIcon from "@mui/icons-material/Close";
  import React, { useRef } from "react";
  
  type ImageUploaderProps = {
    previewUrl?: string;
    onFileInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove?: () => void;
    width?: number | string;
    height?: number | string;
    label?: string;
  };
  
  export default function ImageUploader({
    previewUrl,
    onFileInput,
    onRemove,
    width = 200,
    height = 150,
    label = "Upload Image",
  }: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
  
    const handleClick = () => {
      inputRef.current?.click();
    };
  
    return (
      <Box sx={{ display: "inline-block", textAlign: "center" }}>
        <Box
          sx={{
            width,
            height,
            border: "1px dashed grey",
            borderRadius: 2,
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            bgcolor: "#f9f9f9",
          }}
          onClick={handleClick}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {onRemove && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "white",
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <UploadFileIcon />
              <Typography variant="caption">{label}</Typography>
            </Box>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onFileInput}
          />
        </Box>
      </Box>
    );
  }