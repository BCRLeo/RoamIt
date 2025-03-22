// Single-line import of Material UI components from the higher `material` folder
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material"
/*
Individual imports of each component from their respective component file within the `material` folder
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
*/

import { useState } from 'react';

export default function ExamplePage() {
    const [counter, setCounter] = useState(0);
    const [open, setOpen] = useState(false);
    
    // A function defined in the classical programming way
    function updateCounter() {
        setCounter(counter => counter + 1);
    }

    // A function defined using arrow notation in the modern JavaScript way
    const openPopUp = () => {
        setOpen(true);
    }

    const closePopUp = () => {
        setOpen(false);
    }

    return (
        <>
            <Typography variant = "h2">Example page</Typography>

            <Button variant = "outlined" onClick = {updateCounter}>Increment</Button>
            <Typography>{counter}</Typography>

            <Button variant = "contained" onClick = {openPopUp}>Open pop-up</Button>
            <Dialog open = {open} onClose = {closePopUp}>
                <DialogTitle>Pop up</DialogTitle>
                <DialogContent>This is a pop-up box</DialogContent>
                <DialogActions>
                    <Button variant = "outlined" onClick = {closePopUp}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}