import { Button, Container, Grid2, TextField, Typography } from "@mui/material";
import { FormEvent, useState } from "react";
import { NavLink } from "react-router";
import { logIn } from "../../api/auth";

export default function LogInPage() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmitForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const response = await logIn(login, password);
        console.log(response);
    }

    return (
        <>
            <Typography variant = "h1">Log In</Typography>
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
        </>
    );
}