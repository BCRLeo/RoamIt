import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink } from "react-router-dom";

export default function NavBar() {
    return (
        <AppBar position = "sticky">
            <Box sx = {{ml: 0}}>
                <Toolbar>
                    <IconButton sx = {{mr: "1rem"}}>
                        <MenuIcon />
                    </IconButton>
                    <Button component = {NavLink} to = "/" color = "secondary">
                        <Typography variant = "button" color = "textPrimary">Home</Typography>
                    </Button>
                    <Button component = {NavLink} to = "/example" color = "secondary">
                        <Typography variant = "button" color = "textPrimary">Example</Typography>
                    </Button>
                </Toolbar>
            </Box>
        </AppBar>
    );
}