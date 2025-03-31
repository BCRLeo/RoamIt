import { Card, Container, useTheme } from "@mui/material";
import { ReactNode } from "react";

export default function PopUp({ children }: { children: ReactNode }) {
    const theme = useTheme();

    return (
        <Container
            component = { Card }
            maxWidth = "xs"
            sx = {{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                p: "2rem",
                borderRadius: `calc(${theme.vars.shape.borderRadius.valueOf()} + 1rem)`
            }}
            raised
        >
            { children }
        </Container>
    );
}