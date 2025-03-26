import { Button, Container, Grid2, TextField } from "@mui/material";
import { useState, FormEvent } from "react";
import { NavLink } from "react-router";
import { logIn } from "../authApi";

export default function LogInForm() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmitForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const response = await logIn(login, password);
        console.log(response);
    }

    return (
        <Container maxWidth = "xs" sx = {{ p: "1rem" }}>
            <Grid2 container component = "form" spacing = {2} onSubmit = {event => handleSubmitForm(event)}>
                <Grid2 size = {12}>
                    <TextField
                        label = "Username/Email"
                        variant = "filled"
                        fullWidth
                        onChange = {event => setLogin(event.target.value)}
                        />
                </Grid2>
                <Grid2 size = {12}>
                    <TextField
                        label = "Password"
                        variant = "filled"
                        type = "password"
                        fullWidth
                        onChange = {event => setPassword(event.target.value)}
                        />
                </Grid2>
                <Grid2 size = {12}>
                    <Button type = "submit" variant = "contained">Log In</Button>
                </Grid2>
                <Grid2 size = {12}>
                    <Button component = {NavLink} to = "/signup">Don't have an account? Sign up</Button>
                </Grid2>
            </Grid2>
        </Container>
    );
}