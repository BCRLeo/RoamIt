import { useEffect, useState } from "react";

export default function useUnsavedStatus(unsavedValues: [...any]) {
    const [isUnsaved, setIsUnsaved] = useState(false);

    useEffect(() => {
        for (const value of unsavedValues) {
            if (value !== null) {
                setIsUnsaved(true);
                return;
            }
        }

        setIsUnsaved(false);
    }, [unsavedValues]);

    return isUnsaved;
}