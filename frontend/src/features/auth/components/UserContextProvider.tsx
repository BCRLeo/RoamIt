import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { getCurrentUser, UserData } from "../authApi";

export const UserContext = createContext<{ user: UserData | null, setUser: Dispatch<SetStateAction<UserData | null>> } | null>(null);

export default function UserContextProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        (async () => {
            const response = await getCurrentUser();
            if (response) {
                setUser(response);
            }
        })();
    }, []);

    return (
        <UserContext.Provider value = {{ user: user, setUser: setUser }}>
            { children }
        </UserContext.Provider>
    );
}