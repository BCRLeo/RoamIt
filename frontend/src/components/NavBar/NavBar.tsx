import { AccountCircle, Menu } from "@mui/icons-material";
import { AppBar, Box, Button, IconButton, Toolbar, Typography, useTheme } from "@mui/material";
import type {} from '@mui/material/themeCssVarsAugmentation';
import { NavLink, NavLinkProps } from "react-router-dom";

import DarkModeSwitch from "../../features/theme/components/DarkModeSwitch";
import useUserContext from "../../features/auth/hooks/useUserContext";
import LogOutButton from "../../features/auth/components/LogOutButton";

export default function NavBar() {
    const theme = useTheme();
    const user = useUserContext().user;

    const CustomNavLink = ({ text, ...props }: NavLinkProps & { text: string }) => (
        <NavLink
            { ...props }
            style = {({ isActive }: { isActive: boolean }) => ({
                fontWeight: isActive ? "bold" : "normal",
            })}
        >
            {({ isActive }) => (
                <Typography variant = "button" sx = {{
                    position: "relative",
                    "&::after": {
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        content: "''",
                        width: "80%",
                        height: "100%",
                        borderBottomColor: "inherit",
                        borderBottomWidth: "0.1rem",
                        borderBottomStyle: "inset",
                        transform: "translate(-50%, -10%)",
                        transition: "300ms",
                        opacity: `${ isActive ? "100%" : "0" }`
                    }
                    }}
                >
                    { text }
                </Typography>
            )}
        </NavLink>
    );

    return (
        <AppBar position = "sticky" sx = {{ color: theme.vars.palette.primary.contrastText }} enableColorOnDark>
            <Toolbar>
                <IconButton sx = {{ mr: "0.75rem" }} color = "inherit">
                    <Menu />
                </IconButton>
                <Box>
                    <Button component = { CustomNavLink } to = "/" color = "inherit" text = "Home" />
                    { user &&
                        <Button component = { CustomNavLink } to = "/discover" color = "inherit" text = "Discover" />
                    }
                    <Button component = { CustomNavLink } to = "/example" color = "inherit" text = "Example" />
                </Box>
                <Box sx = {{ flexGrow: 1 }} />
                <Box sx = {{ mr: 0, ml: "auto", width: "fit-content" }}>
                    <DarkModeSwitch />
                    { user ? (
                        <>
                            <LogOutButton />
                            <IconButton color = "inherit">
                                <AccountCircle />
                            </IconButton>
                        </>
                    ) : (
                        <>
                            <Button component = { CustomNavLink } to = "/login" color = "inherit" text = "Log In" />
                            <Button component = { CustomNavLink } to = "/signup" color = "inherit" text = "Sign Up" />
                        </>
                    ) }
                </Box>
            </Toolbar>
        </AppBar>
    );
}