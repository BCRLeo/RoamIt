import { useState } from "react";

import { Button, ButtonProps, Modal } from "@mui/material";
import SignUpForm from "./SignUpForm";
import { ToggleClickProps } from "../../../constants";

export default function SignUpModal({ clickProps, buttonProps }: { clickProps?: ToggleClickProps, buttonProps?: ButtonProps }) {
    if (clickProps) {
        return (
            <>
                <Button onClick = { clickProps.onOpen } { ...buttonProps }>
                    Sign Up
                </Button>
                <Modal open = { clickProps.isOpen } onClose = { clickProps.onClose }>
                    <SignUpForm />
                </Modal>
            </>
        );
    }
    
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick = { () => setIsOpen(true) } { ...buttonProps }>
                Sign Up
            </Button>
            <Modal open = { isOpen } onClose = { () => setIsOpen(false) } >
                <SignUpForm />
            </Modal>
        </>
    );
}
