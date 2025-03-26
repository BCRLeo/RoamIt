import { Typography } from "@mui/material";
import LogInForm from "../../features/auth/components/LogInForm";

export default function LogInPage() {
    return (
        <>
            <Typography variant = "h1">Log In</Typography>
            <LogInForm />
        </>
    );
}