import { DarkModeContext } from "../Providers/Providers";
import { DarkMode, LightMode } from "@mui/icons-material";
import { Switch } from "@mui/material";
import { useContext } from "react";

export default function DarkModeSwitch() {
    const darkModeContext = useContext(DarkModeContext);
    if (!darkModeContext) {
        return (
            <Switch
                icon = {<LightMode sx = {{ verticalAlign: "middle", transform: "translateY(-0.12rem)" }} />}
                checkedIcon = {<DarkMode sx = {{ verticalAlign: "middle", transform: "translateY(-0.15rem)" }} />}
                color = "secondary"
                disableRipple
                disabled
            />
        );
    }

    const { darkMode, setDarkMode } = darkModeContext;

    return (
        <Switch
            checked = {darkMode}
            onChange = {event => setDarkMode(event.target.checked)}
            icon = {<LightMode sx = {{ verticalAlign: "middle", transform: "translateY(-0.12rem)" }} />}
            checkedIcon = {<DarkMode sx = {{ verticalAlign: "middle", transform: "translateY(-0.15rem)" }} />}
            color = "secondary"
            disableRipple
        />
    );
}