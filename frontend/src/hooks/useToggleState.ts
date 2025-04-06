import { useState } from "react";

export function useToggleState(initialState: boolean, onToggle?: ((state: boolean) => void)): [boolean, () => void] {
    const [state, setState] = useState(initialState);

    function toggleState() {
        if (onToggle) {
            onToggle(state);
        }
        
        setState((prev) => !prev);
    }

    return [state, toggleState];
}