import { MouseEventHandler } from "react";

export type ToggleClickProps = {
    isOpen: boolean,
    onOpen: MouseEventHandler<HTMLButtonElement | undefined>,
    onClose: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined
};