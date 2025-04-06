import { useSuspenseQuery } from "@tanstack/react-query";

import useUserContext from "../../auth/hooks/useUserContext";
import { getPublicUserDataFromUsername } from "../accountsApi";

export default function usePublicUserData(username: string) {
    const currentUser = useUserContext().user;

    const { data: user } = useSuspenseQuery({
        queryKey: ["publicUserData", username],
        queryFn: () => getPublicUserDataFromUsername(username)
    });

    const isAuthenticated = !!user && !!currentUser && user.userId === currentUser.userId;

    return { user, isAuthenticated };
}