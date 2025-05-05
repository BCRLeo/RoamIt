import { createContext, Dispatch, ReactNode, SetStateAction, /* useEffect, */ useState } from "react";
import { getCurrentUser, UserData } from "../authApi";
import { useSuspenseQuery } from "@tanstack/react-query";

export const UserContext = createContext<{ user: UserData | null, setUser: Dispatch<SetStateAction<UserData | null>> } | null>(null);

export default function UserContextProvider({ children }: { children: ReactNode }) {
    const { data: initialUser } = useSuspenseQuery({
        queryKey: ["getCurrentUser"],
        queryFn: getCurrentUser
    });

    const [user, setUser] = useState<UserData | null>(initialUser);

    return (
        <UserContext.Provider value = {{ user: user, setUser: setUser }}>
            { children }
        </UserContext.Provider>
    );
}