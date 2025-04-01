import { InputHTMLAttributes, ReactNode } from "react";

import { Button, IconButton, styled } from "@mui/material";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1
});

export default function UploadButton({ icon, label, inputProps }: { icon?: ReactNode, label?: string, accept?: string, multiple?: boolean, inputProps?: InputHTMLAttributes<HTMLInputElement> }) {
    const Input = <VisuallyHiddenInput type = "file" { ...inputProps } />;
    const buttonProps = {
        component: "label",
        title: "Upload"
    }

    if (icon && !label) {
        return (
            <IconButton { ...buttonProps }>
                { icon }
                { Input }
            </IconButton>
        );
    }

    return (
        <Button
            { ...buttonProps }
            variant = "contained"
            startIcon = { icon }
        >
            { label }
            { Input }
        </Button>
    );
}