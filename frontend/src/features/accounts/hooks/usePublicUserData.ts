import { useEffect, useState } from "react";
import { PublicUserData } from "../../auth/authApi";
import useUserContext from "../../auth/hooks/useUserContext";
import { getPublicUserDataFromUsername } from "../accountsApi";

export default function usePublicUserData(username: string) {
    const currentUser = useUserContext().user;
    const [user, setUser] = useState<PublicUserData | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isUserFound, setIsUserFound] = useState(true);

    useEffect(() => {
        (async () => {
            const response = await getPublicUserDataFromUsername(username);
            
            setIsUserFound(response !== null);

            if (!response) return;
            
            setUser(response);
            setIsAuthenticated(response.userId == currentUser?.userId);
        })();
    }, [currentUser]);

    return { user, isAuthenticated, isUserFound };
}