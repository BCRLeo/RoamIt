import { Breakpoint, Card, Container, useTheme } from "@mui/material";
import { ReactNode } from "react";

export default function PopUp({ size, children }: { size?: Breakpoint, children: ReactNode }) {
    const theme = useTheme();

    return (
        <Container
            component = { Card }
            maxWidth = { size ?? "xs" }
            sx = {{
                position: "absolute",
                top: "50%",
                left: "50%",
                maxHeight: "90dvh",
                transform: "translate(-50%, -50%)",
                padding: "2rem",
                borderRadius: `calc(${theme.vars.shape.borderRadius.valueOf()} + 1rem)`,
                overflow: "scroll"
            }}
            raised
        >
            { children }
        </Container>
    );
}