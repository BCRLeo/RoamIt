import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";
import { UserData } from "../authApi";

export const UserContext = createContext<{ user: UserData | null, setUser: Dispatch<SetStateAction<UserData | null>> } | null>(null);

export default function UserContextProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);

    return (
        <UserContext.Provider value = {{ user: user, setUser: setUser }}>
            { children }
        </UserContext.Provider>
    );
}