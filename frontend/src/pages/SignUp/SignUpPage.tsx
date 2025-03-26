import { Typography } from "@mui/material";
import SignUpForm from "../../features/auth/components/SignUpForm";

export default function SignUpPage() {
    return (
        <>
            <Typography variant = "h1">Sign Up</Typography>
            <SignUpForm />
        </>
    );
}