import { Typography } from "@mui/material";
import SignUpForm from "../../features/accounts/components/SignUpForm";

export default function SignUpPage() {
    return (
        <>
            <Typography variant = "h1">Sign Up</Typography>
            <SignUpForm />
        </>
    );
}