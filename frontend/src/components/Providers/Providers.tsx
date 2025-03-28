import { ReactNode } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ThemeContextProvider from "../../features/theme/components/ThemeContextProvider";
import UserContextProvider from "../../features/auth/components/UserContextProvider";

export default function Providers({ children }: {children: ReactNode}) {
    return (
        <ThemeContextProvider>
            <LocalizationProvider dateAdapter = {AdapterDayjs}>
                <UserContextProvider>
                    { children }
                </UserContextProvider>
            </LocalizationProvider>
        </ThemeContextProvider>
    );
}