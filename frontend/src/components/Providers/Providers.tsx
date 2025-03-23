import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";
import { createTheme, GlobalStyles, ThemeProvider, useMediaQuery } from "@mui/material";

export interface DarkModeContextType {
    darkMode: boolean,
    setDarkMode: Dispatch<SetStateAction<boolean>>
};

export const DarkModeContext = createContext<DarkModeContextType | null>(null);

interface ProvidersProps {
    children: ReactNode
};

export default function Providers({ children }: ProvidersProps) {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const [darkMode, setDarkMode] = useState(prefersDarkMode);

    const primary = {
        light: "#C22413",
        dark: "#B23123"
    }

    const background = {
        light: "#FFF",
        dark: "#121212"
    }

    const theme = createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
            primary: {
                main: darkMode ? primary.dark : primary.light,
            },
            background: {
                default: darkMode ? background.dark : background.light
            }
        },
        cssVariables: true
    });

    return (
        <ThemeProvider theme = {theme}>
            <DarkModeContext.Provider value = {{ darkMode: darkMode, setDarkMode: setDarkMode}}>
                <GlobalStyles styles = {{
                    html: {
                        backgroundColor: theme.palette.background.default
                    }
                }} />
                {children}
            </DarkModeContext.Provider>
        </ThemeProvider>
    );
}