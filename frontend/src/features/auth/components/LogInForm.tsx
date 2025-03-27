import { useState, FormEvent, ChangeEvent } from "react";

import { Box, Button, Container, Grid2, TextField, Typography } from "@mui/material";
import { Error } from "@mui/icons-material";
import { NavLink } from "react-router";

import { logIn } from "../authApi";

export default function LogInForm() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

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
        const response = await logIn(login, password);

        if (!response) {
            setError("Invalid email/username or password.");
            return;
        }

        setError("User successfully logged in.");
    }

    return (
        <Container maxWidth = "xs" sx = {{ p: "1rem" }}>
            <Grid2 container component = "form" spacing = { 2 } onSubmit = { event => handleSubmitForm(event) }>
                <Grid2 size = { 12 }>
                    <TextField
                        label = "Email or Username"
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
                <Grid2 size = { 12 }>
                    <Button component = { NavLink } to = "/signup">Don't have an account? Sign up</Button>
                </Grid2>
            </Grid2>
        </Container>
    );
}