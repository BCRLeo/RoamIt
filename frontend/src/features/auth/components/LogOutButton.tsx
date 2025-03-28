import { Button } from "@mui/material";
import { useNavigate } from "react-router";

import useUserContext from "../hooks/useUserContext";

export default function LogOutButton() {
    const userContext = useUserContext();
    const navigate = useNavigate();

    if (!userContext || !userContext.user) {
        return (
            <Button color = "inherit" disabled>Log Out</Button>
        );
    }

    const setUser = userContext.setUser;

    function handleLogOut() {
        setUser(null);
        navigate("/");
    }

    return (
        <Button onClick = { handleLogOut } color = "inherit">Log Out</Button>
    );
}