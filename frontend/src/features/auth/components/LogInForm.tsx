import { useState, FormEvent, ChangeEvent } from "react";

import { Box, Button, Grid2, TextField, Typography } from "@mui/material";
import { Error } from "@mui/icons-material";
import { useNavigate } from "react-router";

import { logIn } from "../authApi";
import useUserContext from "../hooks/useUserContext";
import PopUp from "../../../components/PopUp/PopUp";

export default function LogInForm({ openSignUp }: { openSignUp?: () => void }) {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    const setUser = useUserContext().setUser;
    const navigate = useNavigate();

    function updateLogin(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        setLogin(event.target.value);
        setError("");
    }

    function updatePassword(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        setPassword(event.target.value);
        setError("");
    }

    async function handleSubmitForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!login && !password) {
            setError("Please enter an email/username and password.");
            return;
        } else if (!login) {
            setError("Please enter an email/username.");
            return;
        } else if (!password) {
            setError("Please enter a password.");
            return;
        }

        const response = await logIn(login, password);

        if (!response) {
            setError("Invalid email/username or password.");
            return;
        }

        setUser(response);
        navigate("/");
    }

    return (
        <PopUp>
            <Typography variant = "h2" pb = "1rem">Log In</Typography>
            <Grid2 container component = "form" spacing = { 2 } onSubmit = { handleSubmitForm }>
                <Grid2 size = { 12 }>
                    <TextField
                        label = "Email or username"
                        variant = "filled"
                        fullWidth
                        onChange = { updateLogin }
                    />
                </Grid2>
                <Grid2 size = { 12 }>
                    <TextField
                        label = "Password"
                        variant = "filled"
                        type = "password"
                        fullWidth
                        onChange = { updatePassword }
                    />
                </Grid2>
                { error !== "" && (
                    <Grid2 size = { 12 }>
                        <Box sx = {{ display: "inline-flex", gap: "0.5rem", alignContent: "center" }}>
                            <Error color = "error" />
                            <Typography variant = "body1" color = "error">{ error }</Typography>
                        </Box>
                    </Grid2>
                )}
                <Grid2 size = { 12 }>
                    <Button type = "submit" variant = "contained">Log In</Button>
                </Grid2>
                { openSignUp &&
                    <Grid2 size = { 12 }>
                        <Button variant = "text" onClick = { () => openSignUp() }>
                            Don't have an account? Sign up
                        </Button>
                    </Grid2>
                }
            </Grid2>
        </PopUp>
    );
}