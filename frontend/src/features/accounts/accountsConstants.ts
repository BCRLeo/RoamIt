import dayjs from "dayjs";
import { UserData } from "../auth/authApi";

export const USERNAME_REGEX = /^[A-Za-z][\w.]{3,30}$/;
export const EMAIL_REGEX = /(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&-]{8,}$/;
export const MIN_BIRTHDAY = dayjs().subtract(125, "year");
export const MAX_BIRTHDAY = dayjs().subtract(18, "year");

export const USER_TAG_OPTIONS = [
    "Travel",
    "Cooking",
    "Reading",
    "Gaming",
    "Music",
    "Art",
    "Writing",
    "Photography",
    "Fitness",
    "Hiking",
    "Volunteering",
    "Machine Learning",
    "Data Science",
    "Design",
    "UX/UI",
    "Philosophy",
    "Psychology",
    "Chess"
];

const genders = ["Man", "Woman", "Other", "PNS"] as const;
export type Gender = (typeof genders)[number];

export function isGender(value: string): value is Gender {
    return (genders as readonly string[]).includes(value);
}

export type FriendData = UserData & { timestamp: string };

export type FriendRequest = {
    requesterId: number,
    receiverId: number,
    status: "pending" | "accepted" | "declined",
    timestamp: string
}

export type CategorizedFriendRequests = {
    accepted: FriendRequest[],
    outgoing: FriendRequest[],
    incoming: FriendRequest[]
}