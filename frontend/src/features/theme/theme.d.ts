import { PaletteColorOptions, PaletteColor } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface Palette {
        message: PaletteColor;
    };

    interface PaletteOptions {
        message?: PaletteColorOptions;
    };
};