import { MouseEventHandler } from "react";

export type ToggleClickProps = {
    isOpen: boolean,
    onOpen: MouseEventHandler<HTMLButtonElement | undefined>,
    onClose: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined
};

export type ApiResult<T> = 
    { status: "success", data: T } |
    { status: "success", data: null } |
    { status: "error" };