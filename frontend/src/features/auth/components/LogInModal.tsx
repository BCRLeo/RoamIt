import { useState } from "react";

import { Button, ButtonProps, Modal } from "@mui/material";
import { ClickProps } from "../../accounts/components/SignUpModal";
import LogInForm from "./LogInForm";

export default function LogInModal({ clickProps, buttonProps }: { clickProps?: ClickProps, buttonProps?: ButtonProps }) {
    if (clickProps) {
        return (
            <>
                <Button onClick = { clickProps.onOpen } { ...buttonProps }>
                    Log In
                </Button>
                <Modal open = { clickProps.isOpen } onClose = { clickProps.onClose }>
                    <LogInForm />
                </Modal>
            </>
        );
    }

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick = { () => setIsOpen(true) } { ...buttonProps }>
                Log In
            </Button>
            <Modal open = { isOpen } onClose = { () => setIsOpen(false) }>
                <LogInForm />
            </Modal>
        </>
    );
}