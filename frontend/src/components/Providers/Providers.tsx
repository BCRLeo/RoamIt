import { ReactNode } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ThemeContextProvider from "../../features/theme/components/ThemeContextProvider";
import UserContextProvider from "../../features/auth/components/UserContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APIProvider } from "@vis.gl/react-google-maps";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client = { queryClient }>
            <APIProvider apiKey = { process.env.GOOGLE_API_KEY! }>
                <ThemeContextProvider>
                    <LocalizationProvider dateAdapter = { AdapterDayjs }>
                        <UserContextProvider>
                            { children }
                        </UserContextProvider>
                    </LocalizationProvider>
                </ThemeContextProvider>
            </APIProvider>
        </QueryClientProvider>
    );
}