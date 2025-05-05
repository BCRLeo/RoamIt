import usePublicUserData from "../hooks/usePublicUserData";

export default function Username({ userId }: { userId: number }) {
    const user = usePublicUserData(userId).user;

    if (user) return (
        <>{ user.username }</>
    );

    return;
}