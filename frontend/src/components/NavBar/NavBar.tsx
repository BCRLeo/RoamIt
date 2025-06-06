import { AccountCircle, Menu } from "@mui/icons-material";
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import type {} from '@mui/material/themeCssVarsAugmentation';
import { NavLink, NavLinkProps } from "react-router-dom";

import DarkModeSwitch from "../../features/theme/components/DarkModeSwitch";
import useUserContext from "../../features/auth/hooks/useUserContext";
import LogOutButton from "../../features/auth/components/LogOutButton";
import AuthModals from "../../features/auth/components/AuthModals";

export default function NavBar() {
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
                mb: "1.5rem",
                height: "4rem", 
                overflowX: "auto"
            }}
            enableColorOnDark
        >
            <Toolbar sx = {{
                display: "flex",
                paddingX: 2,
                minHeight: "4rem",
                whiteSpace: "nowrap",
                overflowX: "auto",
                alignItems: "center",
                gap: "1rem"
            }}
            >
                <IconButton sx = {{ mr: "0.75rem" }} color = "inherit">
                    <Menu />
                </IconButton>
                <Box>
                    <Button component = { CustomNavLink } to = "/" color = "inherit" text = "Home" />
                    { user &&
                        <>
                            <Button component = { CustomNavLink } to = "/discover" color = "inherit" text = "Discover" />
                            <Button component = { CustomNavLink } to = "/listings" color = "inherit" text = "Listings" />
                        </>
                    }
                </Box>
                <Box sx = {{ flexGrow: 1 }} />
                <Box sx = {{ mr: 0, ml: "auto", width: "fit-content" }}>
                    <DarkModeSwitch />
                    { user ? (
                        <>
                            <Button component = { CustomNavLink } to = "/chats" color = "inherit" text = "Chats" />
                            <LogOutButton />
                            <IconButton component = { NavLink } to = { `/users/${user.username}` } color = "inherit">
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