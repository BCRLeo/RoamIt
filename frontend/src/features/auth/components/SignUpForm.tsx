import { ChangeEvent, FormEvent, useState } from "react";

import { Button, FormControl, FormHelperText, Grid2, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { DateField } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useNavigate } from "react-router";

import { isEmailAvailable, isUsernameAvailable, signUp } from "../authApi";
import { EMAIL_REGEX, MAX_BIRTHDAY, MIN_BIRTHDAY, PASSWORD_REGEX } from "../authConstants";
import useUserContext from "../hooks/useUserContext";
import PopUp from "../../../components/PopUp/PopUp";

enum Gender {
    Man = "Man",
    Woman = "Woman",
    Other = "Other",
    NA = "NA"
}

export default function SignUpForm({ openLogIn }: { openLogIn?: () => void }) {
    const [firstName, setFirstName] = useState("");
    const [firstNameError, setFirstNameError] = useState("");

    const [lastName, setLastName] = useState("");
    const [lastNameError, setLastNameError] = useState("");

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const [birthday, setBirthday] = useState("");
    const [birthdayError, setBirthdayError] = useState("");

    const [gender, setGender] = useState("");
    const [genderError, setGenderError] = useState("");

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const passwordRegExDescription = "Password must contain at least 8 characters, including an uppercase, a lowercase, and a number.";

    const [formError, setFormError] = useState("");

    const setUser = useUserContext().setUser;
    const navigate = useNavigate();

    async function updateFirstName(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        // Check name RegEx once we define it
        setFirstName(event.target.value);
        setFirstNameError("");
        setFormError("");
    }

    async function updateLastName(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        // Check name RegEx once we define it
        setLastName(event.target.value);
        setLastNameError("");
        setFormError("");
    }

    async function updateEmail(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const value = event.target.value;
        setEmail(value);
        setFormError("");

        if (!EMAIL_REGEX.test(value)) {
            setEmailError("");
            return;
        }

        const available = await isEmailAvailable(value);

        if (available) {
            setEmailError("");
            return;
        }
        
        setEmailError("Email already in use.");
    }

    async function updateUsername(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const value = event.target.value;
        setUsername(value);
        setFormError("");
        // Check username RegEx once we define it
        const available = await isUsernameAvailable(value);

        if (available) {
            setUsernameError("");
            return;
        }

        setUsernameError("Username already in use.");
    }

    function updateBirthday(value: Dayjs | null) {
        setFormError("");
        
        if (!value) {
            setBirthday("");
            setBirthdayError("");
            return;
        }

        if (!value.isValid()) {
            setBirthday("");
            setBirthdayError("");
            return;
        }

        setBirthday(value.format("YYYY-MM-DD"));

        if (value.isBefore(MIN_BIRTHDAY) || value.isAfter(MAX_BIRTHDAY)) {
            setBirthdayError(`Birthday must be between ${ MIN_BIRTHDAY.format("D MMMM, YYYY") } and ${ MAX_BIRTHDAY.format("D MMMM, YYYY") }.`);
            return;
        }

        setBirthdayError("");
    }

    function updateGender(event: SelectChangeEvent<string>) {
        const value = event.target.value;
        setGender(value);
        setFormError("");

        if (!(value in Gender)) {
            setGenderError("Invalid gender.");
            return;
        }

        setGenderError("");
    }

    async function updatePassword(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const value = event.target.value;
        setPassword(value);
        setFormError("");

        if (!value) {
            setPasswordError("");
            return;
        }

        if (!PASSWORD_REGEX.test(value)) {
            setPasswordError(passwordRegExDescription);
            return;
        }

        setPasswordError("");
    }

    function resetAllErrors() {
        setFirstNameError("");
        setLastNameError("");
        setEmailError("");
        setUsernameError("");
        setBirthdayError("");
        setGenderError("");
        setPasswordError("");
    }

    async function handleSubmitForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        let missingError = false;
        let otherError = false;

        if (firstNameError || lastNameError || usernameError || emailError || genderError || birthdayError || passwordError) {
            otherError = true;
        }

        if (!firstName) {
            setFirstNameError("Missing first name.");
            missingError = true;
        }

        if (!lastName) {
            setLastNameError("Missing last name.");
            missingError = true;
        }

        if (!username) {
            setUsernameError("Missing username.");
            missingError = true;
        }

        if (!email) {
            setEmailError("Missing email.");
            missingError = true;
        } else if (!EMAIL_REGEX.test(email)) {
            setEmailError("Invalid email address.");
            otherError = true;
        }

        if (!gender) {
            setGenderError("Missing gender.");
            missingError = true;
        }

        if (!birthday) {
            setBirthdayError("Missing birthday.");
            missingError = true;
        }

        if (!password) {
            setPasswordError("Missing password.");
            missingError = true;
        }

        if (otherError || missingError) {
            setFormError("Please ensure all values are correct.");
            return;
        }

        const response = await signUp(firstName, lastName, username, email, password, birthday, gender);

        resetAllErrors();

        if (!response) {
            setFormError("Error signing up user.");
            return;
        }

        setFormError("User successfully registered.");
        setUser(response);
        navigate("/");
    }

    return (
        <PopUp>
            <Typography variant = "h2" pb = "1rem">Sign Up</Typography>
            <Grid2 container component = "form" spacing = { 2 } onSubmit = { handleSubmitForm } noValidate >
                <Grid2 size = { 6 }>
                    <TextField
                        label = "First name"
                        variant = "filled"
                        fullWidth
                        onChange = { updateFirstName }
                        helperText = { firstNameError }
                        error = { firstNameError !== "" }
                        required
                    />
                </Grid2>
                <Grid2 size = { 6 }>
                    <TextField
                        label = "Last name"
                        variant = "filled"
                        fullWidth
                        onChange = { updateLastName }
                        helperText = { lastNameError }
                        error = { lastNameError !== "" }
                        required
                    />
                </Grid2>
                <Grid2 size = { 12 }>
                    <TextField
                        label = "Email"
                        type = "email"
                        variant = "filled"
                        fullWidth
                        onChange = { updateEmail }
                        helperText = { emailError }
                        error = { emailError !== "" }
                        required
                    />
                </Grid2>
                <Grid2 size = {12}>
                    <TextField
                        label = "Username"
                        variant = "filled"
                        fullWidth
                        onChange = { updateUsername }
                        helperText = { usernameError }
                        error = { usernameError !== "" }
                        required
                    />
                </Grid2>
                <Grid2 size = {12}>
                    <DateField
                        label = "Birthday"
                        variant = "filled"
                        fullWidth
                        minDate = { MIN_BIRTHDAY }
                        maxDate = { MAX_BIRTHDAY }
                        onChange = { updateBirthday }
                        slotProps = { birthdayError ? {
                            textField: {
                                helperText: birthdayError,
                                error: birthdayError !== ""
                            }
                        } : {} }
                        required
                    />
                </Grid2>
                <Grid2 size = { 12 }>
                    <FormControl fullWidth required>
                        <InputLabel>Gender</InputLabel>
                        <Select
                            label = "Gender"
                            value = { gender }
                            onChange = { updateGender }
                            error = { genderError !== "" }
                            sx = {{ textAlign: "left"}}
                            required
                        >
                            <MenuItem disabled selected>-- Select an option --</MenuItem>
                            <MenuItem value = { Gender.Man }>Man</MenuItem>
                            <MenuItem value = { Gender.Woman }>Woman</MenuItem>
                            <MenuItem value = { Gender.Other }>Other</MenuItem>
                            <MenuItem value = { Gender.NA }>Prefer not to say</MenuItem>
                        </Select>
                        { genderError && 
                            <FormHelperText error = { genderError !== "" }>{genderError}</FormHelperText>
                        }
                    </FormControl>
                </Grid2>
                <Grid2 size = {12}>
                    <TextField
                        label = "Password"
                        type = "password"
                        slotProps = {{
                            htmlInput: {
                                pattern: PASSWORD_REGEX
                            }
                        }}
                        helperText = { passwordError ? passwordError : passwordRegExDescription }
                        variant = "filled"
                        fullWidth
                        onChange = { updatePassword }
                        error = { passwordError !== "" }
                        required
                    />
                </Grid2>
                <Grid2 size = { 12 }>
                    <Button type = "submit" variant = "contained" sx = {{ display: "block", mx: "auto" }}>
                        Sign Up
                    </Button>
                    { formError &&
                        <Typography variant = "caption" color = "error">
                            {formError}
                        </Typography>
                    }
                </Grid2>
                { openLogIn && 
                    <Grid2 size = { 12 }>
                        <Button variant = "text" onClick = { () => openLogIn() }>
                            Already have an account? Log in
                        </Button>
                    </Grid2>
                }
            </Grid2>
        </PopUp>
    );
}