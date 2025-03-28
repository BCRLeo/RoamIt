import { useEffect, useState } from "react";

import { Button, ButtonProps, Modal } from "@mui/material";
import SignUpForm from "./SignUpForm";
import LogInForm from "./LogInForm";

export default function AuthModals( buttonProps: ButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [form, setForm] = useState(
        isSignUp ?
            <SignUpForm openLogIn = { () => setIsSignUp(false) } />
        :
            <LogInForm openSignUp = { () => setIsSignUp(true) } />
    );

    useEffect(() => {
        setForm(
            isSignUp ?
                <SignUpForm openLogIn = { () => setIsSignUp(false) } />
            :
                <LogInForm openSignUp = { () => setIsSignUp(true) } />
        );
    }, [isSignUp])

    return (
        <>
            <Button onClick = { () => { setIsSignUp(false), setIsOpen(true) } } { ...buttonProps }>
                Log In
            </Button>
            <Button onClick = { () => { setIsSignUp(true), setIsOpen(true) } } { ...buttonProps }>
                Sign Up
            </Button>
            <Modal open = { isOpen } onClose = { () => setIsOpen(false) } >
                { form }
            </Modal>
        </>
    );
}
