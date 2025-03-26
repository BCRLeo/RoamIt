import { createTheme, GlobalStyles, ThemeProvider, useMediaQuery } from "@mui/material";
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";

export const ThemeContext = createContext<{darkMode: boolean, setDarkMode: Dispatch<SetStateAction<boolean>>} | null>(null);

export default function ThemeContextProvider({ children }: { children: ReactNode}) {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const [darkMode, setDarkMode] = useState(prefersDarkMode);

    useEffect(() => {
        setDarkMode(prefersDarkMode);
    }, [prefersDarkMode]);

    const primary = "#B32919";

    const background = {
        light: "#FFF",
        dark: "#191919"
    };

    const theme = createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
            primary: {
                main: primary
            },
            background: {
                default: darkMode ? background.dark : background.light
            }
        },
        cssVariables: true
    });

    return (
        <ThemeProvider theme = {theme}>
            <ThemeContext.Provider value = {{ darkMode: darkMode, setDarkMode: setDarkMode }}>
                <GlobalStyles styles = {{
                        html: {
                            backgroundColor: theme.palette.background.default
                        }
                    }} />
                {children}
            </ThemeContext.Provider>
        </ThemeProvider>
    );
}