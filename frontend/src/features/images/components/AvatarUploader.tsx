import { Avatar, Box, IconButton, Typography, SxProps, Theme} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import React, { useRef, useState, useEffect } from "react";

type LabelVisibility = "text" | "hover";

type AvatarUploaderProps = {
  label?: string;
  labelVisibility?: LabelVisibility;  // how is the label displayed
  labelHoverTargetRef?: React.RefObject<HTMLElement>;
  previewUrl?: string;
  avatarSx?: SxProps<Theme>;
  onClickUpload?: () => void;
  onFileInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  size?: number;
  labelSx?: SxProps<Theme>;  //
  fallback?: React.ReactNode;
};

export default function AvatarUploader({
  label,
  labelVisibility = 'text',
  labelHoverTargetRef,
  previewUrl,
  avatarSx,
  onClickUpload,
  onFileInput,
  size = 100,
  labelSx,
  fallback
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClickUpload?.(); // optional external callback
    inputRef.current?.click();
  };

  const defaultLabelSx: SxProps<Theme> = {
    position: "absolute",
    bottom: -25,
    left: "50%",
    transform: "translateX(-50%)",
    opacity: 1,
    transition: "opacity 0.2s ease-in-out",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  };

  useEffect(() => {
    if (labelVisibility !== "hover" || !labelHoverTargetRef?.current) return;

    const target = labelHoverTargetRef.current;
    const enter = () => setIsHovered(true);
    const leave = () => setIsHovered(false);

    target.addEventListener("mouseenter", enter);
    target.addEventListener("mouseleave", leave);

    return () => {
      target.removeEventListener("mouseenter", enter);
      target.removeEventListener("mouseleave", leave);
    };
  }, [labelVisibility, labelHoverTargetRef]);

  const showLabel =
    labelVisibility === "text" ? true : isHovered;

return (
    <Box
        sx={{
        position: "relative",
        display: "inline-block",
        textAlign: "center",
        mb: 2,
        }}
    >
        <Avatar
        src={previewUrl ?? undefined}
        sx={{
            width: size,
            height: size,
            mx: "auto",
            fontSize: size / 2,
            ...avatarSx,
          }}
        >
        {!previewUrl && fallback}
        </Avatar>

        <IconButton
        ref={labelHoverTargetRef as React.RefObject<HTMLButtonElement>}
        onClick={handleClick}
        sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: "white",
        }}
        >
        <PhotoCamera />
        </IconButton>

        <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFileInput}
        />

        {label && showLabel && (
        <Typography
            variant="caption"
            sx={{
                ...defaultLabelSx,
                ...labelSx,
            }}
        >
            {label}
        </Typography>
        )}
    </Box>
    );
}