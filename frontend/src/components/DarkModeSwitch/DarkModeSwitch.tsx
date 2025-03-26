import { DarkMode, LightMode } from "@mui/icons-material";
import { Switch } from "@mui/material";
import useThemeContext from "../../features/theme/hooks/useThemeContext";

export default function DarkModeSwitch() {
    const darkModeContext = useThemeContext();

    if (!darkModeContext) {
        return (
            <Switch
                icon = {<LightMode sx = {{ verticalAlign: "middle", transform: "translateY(-0.12rem)" }} />}
                checkedIcon = {<DarkMode sx = {{ verticalAlign: "middle", transform: "translateY(-0.15rem)" }} />}
                color = "default"
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
            color = "default"
            disableRipple
        />
    );
}