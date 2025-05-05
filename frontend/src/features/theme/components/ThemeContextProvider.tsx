import { createTheme, GlobalStyles, ThemeProvider, useMediaQuery } from "@mui/material";
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import useThemedOption from "../hooks/useThemedOption";

export const ThemeContext = createContext<{ darkMode: boolean, setDarkMode: Dispatch<SetStateAction<boolean>> } | null>(null);

export default function ThemeContextProvider({ children }: { children: ReactNode }) {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const [darkMode, setDarkMode] = useState(prefersDarkMode);

    useEffect(() => {
        setDarkMode(prefersDarkMode);
    }, [prefersDarkMode]);

    const primary = "#f7280f";

    const background = {
        light: "#FFF",
        dark: "#191919"
    };
    const themedBackground = useThemedOption(background.light, background.dark, darkMode);
    const themedMessage = useThemedOption(background.dark, "#757171", darkMode);
    
    const theme = createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
            primary: {
                main: primary
            },
            background: {
                default: themedBackground
            },
            message: {
                main: themedMessage
            }
        },
        typography: {
            fontFamily: "'Nunito', 'Arial', sans-serif"
        },
        shape: {
            borderRadius: 16
        },
        cssVariables: true
    });

    const inputGlobalStyles = <GlobalStyles styles = {{
        html: {
            backgroundColor: theme.palette.background.default
        }
    }} />;

    return (
        <ThemeProvider theme = { theme }>
            <ThemeContext.Provider value = {{ darkMode: darkMode, setDarkMode: setDarkMode }}>
                { inputGlobalStyles }
                { children }
            </ThemeContext.Provider>
        </ThemeProvider>
    );
}