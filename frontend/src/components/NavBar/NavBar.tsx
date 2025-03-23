import { Menu } from "@mui/icons-material";
import { AppBar, Box, Button, IconButton, Toolbar, useTheme } from "@mui/material";
import type {} from '@mui/material/themeCssVarsAugmentation';
import { NavLink } from "react-router-dom";
import DarkModeSwitch from "../DarkModeSwitch/DarkModeSwitch";

export default function NavBar() {
    const theme = useTheme();

    return (
        <AppBar position = "sticky">
            <Box sx = {{ ml: 0, color: theme.vars.palette.primary.contrastText }}>
                <Toolbar>
                    <IconButton sx = {{ mr: "0.75rem" }} color = "inherit">
                        <Menu />
                    </IconButton>
                    <Button component = {NavLink} to = "/" color = "inherit">Home</Button>
                    <Button component = {NavLink} to = "/example" color = "inherit">Example</Button>
                    <DarkModeSwitch />
                </Toolbar>
            </Box>
        </AppBar>
    );
}