import { Button, Container, FormControl, Grid2, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { DateField } from "@mui/x-date-pickers";
import { FormEvent, useState } from "react";
import { NavLink } from "react-router";
import { signUp } from "../authApi";

enum Gender {
    Man = "M",
    Woman = "W",
    Other = "O",
    NA = "NA"
}

export default function SignUpForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [birthday, setBirthday] = useState("");
    const [gender, setGender] = useState<string>(Gender.NA);
    const [password, setPassword] = useState("");

    async function handleSubmitForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const response = await signUp(firstName, lastName, username, email, password, birthday, gender);
        console.log(response);
    }

    return (
        <Container maxWidth = "xs" sx = {{ p: "1rem" }}>
            <Grid2 container component = "form" spacing = {2} onSubmit = {handleSubmitForm}>
                <Grid2 size = {6}>
                    <TextField
                        label = "First name"
                        variant = "filled"
                        fullWidth
                        onChange = {event => setFirstName(event.target.value)}
                        />
                </Grid2>
                <Grid2 size = {6}>
                    <TextField
                        label = "Last name"
                        variant = "filled"
                        fullWidth
                        onChange = {event => setLastName(event.target.value)}
                        />
                </Grid2>
                <Grid2 size = {12}>
                    <TextField
                        label = "Email"
                        type = "email"
                        variant = "filled"
                        fullWidth
                        onChange = {event => setEmail(event.target.value)}
                        />
                </Grid2>
                <Grid2 size = {12}>
                    <TextField
                        label = "Username"
                        variant = "filled"
                        fullWidth
                        onChange = {event => setUsername(event.target.value)}
                        />
                </Grid2>
                <Grid2 size = {12}>
                    <DateField
                        label = "Birthday"
                        variant = "filled"
                        fullWidth
                        onChange = {value => (value && value.isValid()) ? setBirthday(value.format("YYYY-MM-DD")) : setBirthday("")} 
                        />
                </Grid2>
                <Grid2 size = {12}>
                    <FormControl fullWidth>
                        <InputLabel>Gender</InputLabel>
                        <Select label = "Gender" value = {gender} onChange = {event => setGender(event.target.value)}>
                            <MenuItem value = {Gender.Man}>Man</MenuItem>
                            <MenuItem value = {Gender.Woman}>Woman</MenuItem>
                            <MenuItem value = {Gender.Other}>Other</MenuItem>
                            <MenuItem value = {Gender.NA}>Prefer not to say</MenuItem>
                        </Select>
                    </FormControl>
                </Grid2>
                <Grid2 size = {12}>
                    <TextField
                        label = "Password"
                        type = "password"
                        helperText = "Password must contain at least 8 characters, including an uppercase, a lowercase, and a number."
                        variant = "filled"
                        fullWidth
                        onChange = {event => setPassword(event.target.value)}
                        />
                </Grid2>
                <Grid2 size = {12}>
                    <Button type = "submit" variant = "contained">Sign Up</Button>
                </Grid2>
                <Grid2 size = {12}>
                    <Button component = {NavLink} to = "/login" variant = "text">Already have an account? Log in</Button>
                </Grid2>
            </Grid2>
        </Container>
    );
}