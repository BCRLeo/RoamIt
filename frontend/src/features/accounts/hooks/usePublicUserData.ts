import { useSuspenseQuery } from "@tanstack/react-query";

import useUserContext from "../../auth/hooks/useUserContext";
import { getUserData } from "../accountsApi";
import { PublicUserData } from "../../auth/authApi";

export default function usePublicUserData(username: string): { user: PublicUserData | null, isAuthenticated: boolean }
export default function usePublicUserData(userId: number): { user: PublicUserData | null, isAuthenticated: boolean }
export default function usePublicUserData(usernameOrUserId: string | number): { user: PublicUserData | null, isAuthenticated: boolean } {
    const currentUser = useUserContext().user;

    const { data: user } = useSuspenseQuery({
        queryKey: ["publicUserData", usernameOrUserId],
        queryFn: () => getUserData(usernameOrUserId, true)
    });

    const isAuthenticated = !!user && !!currentUser && user.id === currentUser.id;

    return { user, isAuthenticated };
}