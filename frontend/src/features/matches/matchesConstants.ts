import { Dayjs } from "dayjs";

export type SwipeData = {
    id: number,
    swipedByListingId: number,
    swipedOnListingId: number,
    isLike: boolean,
    timestamp: Dayjs
};

export type CategorizedSwipeData = {
    outgoing: SwipeData[],
    incoming: SwipeData[]
}

export type MatchData = {
    id: number,
    listing1Id: number,
    listing2Id: number,
    timestamp: Dayjs
};