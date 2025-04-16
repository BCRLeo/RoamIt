import { AccountCircle, Menu } from "@mui/icons-material";
import { AppBar, Box, Button, IconButton, Toolbar, Typography, useTheme } from "@mui/material";
import type {} from '@mui/material/themeCssVarsAugmentation';
import { NavLink, NavLinkProps } from "react-router-dom";

import DarkModeSwitch from "../../features/theme/components/DarkModeSwitch";
import useUserContext from "../../features/auth/hooks/useUserContext";
import LogOutButton from "../../features/auth/components/LogOutButton";
import AuthModals from "../../features/auth/components/AuthModals";

export default function NavBar() {
    const theme = useTheme();
    const user = useUserContext().user;

    const CustomNavLink = ({ text, ...props }: NavLinkProps & { text: string }) => (
        <NavLink { ...props }>
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
        <AppBar
            position = "sticky"
            sx = {{
                color: theme.vars.palette.primary.contrastText,
                mb: "1.5rem"
            }}
            enableColorOnDark
        >
            <Toolbar>
                <IconButton sx = {{ mr: "0.75rem" }} color = "inherit">
                    <Menu />
                </IconButton>
                <Box>
                    <Button component = { CustomNavLink } to = "/" color = "inherit" text = "Home" />
                    { user &&
                        <>
                            <Button component = { CustomNavLink } to = "/discover" color = "inherit" text = "Discover" />
                            <Button component = { CustomNavLink } to = "/listings" color = "inherit" text = "Listings" />
                            <Button component = { CustomNavLink } to = "/chat" color = "inherit" text = "Chat" />
                        </>
                    }
                </Box>
                <Box sx = {{ flexGrow: 1 }} />
                <Box sx = {{ mr: 0, ml: "auto", width: "fit-content" }}>
                    <DarkModeSwitch />
                    { user ? (
                        <>
                            <LogOutButton />
                            <IconButton component = { NavLink } to = { `/${user.username}` } color = "inherit">
                                <AccountCircle />
                            </IconButton>
                        </>
                    ) : (
                        <>
                            <AuthModals color = "inherit" />
                        </>
                    ) }
                </Box>
            </Toolbar>
        </AppBar>
    );
}