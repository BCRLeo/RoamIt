import { useContext } from "react";

import { ThemeContext } from "../components/ThemeContextProvider";

export default function useThemeContext() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useThemeContext must be used within a ThemeContextProvider");
    }

    return context;
}