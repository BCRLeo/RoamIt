import usePublicUserData from "../hooks/usePublicUserData";

export default function Name({ userId, type = "full" }: { userId: number, type?: "full" | "first" | "last" }) {
    const user = usePublicUserData(userId).user;

    if (!user) return;

    switch (type) {
        case "full":
            return <>{ user.firstName } { user.lastName }</>;
        case "first":
            return <>{ user.firstName }</>;
        case "last":
            return <>{ user.lastName }</>;
    }
}