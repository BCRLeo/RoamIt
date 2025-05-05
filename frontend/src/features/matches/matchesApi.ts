import dayjs from "dayjs";
import { ApiResult } from "../../constants";
import { CategorizedSwipeData, MatchData } from "./matchesConstants";

export async function getListingRecommendations(listingId: number): Promise<ApiResult<number[]>> {
    try {
        const response = await fetch(`/api/listings/${ listingId }/recommendations`, { method: "GET" });

        if (response.status === 204) {
            return { status: "success", data: null };
        }
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        return { status: "success", data: data.data };
    } catch (error) {
        console.error(`Error retrieving listing #${ listingId }'s listing recommendations:`, error);
        return { status: "error", message: String(error) };
    }
}

export async function swipeListing(byListingId: number, onListingId: number, isLike: boolean): Promise<ApiResult<MatchData>> {
    try {
        const response = await fetch(`/api/listings/${ byListingId }/swipes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                target_listing_id: onListingId,
                is_like: isLike
            })
        });

        if (response.status === 204) {
            return { status: "success", data: null };
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        const matchData = data.data;
        matchData.timestamp = dayjs(matchData.timestamp);

        return { status: "success", data: matchData };
    } catch (error) {
        console.error(`Error swiping listing #${ onListingId } by listing #${ byListingId }:`, error);
        return { status: "error", message: String(error) };
    }
}

export async function getSwipes(): Promise<ApiResult<CategorizedSwipeData>> {
    try {
        const response = await fetch("/api/swipes", { method: "GET" });

        if (response.status === 204) {
            return { status: "success", data: null };
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        const outgoingSwipes = data.data.outgoing;
        const incomingSwipes = data.data.incoming;

        for (const swipe of outgoingSwipes) {
            swipe.timestamp = dayjs(swipe.timestamp);
        }

        for (const swipe of incomingSwipes) {
            swipe.timestamp = dayjs(swipe.timestamp);
        }

        return { status: "success", data: {
            outgoing: outgoingSwipes,
            incoming: incomingSwipes
        }}
    } catch (error) {
        console.error("Error retrieving user's swipes:", error);
        return { status: "error", message: String(error) };
    }
}

// TODO: add getIncomingSwipes and getOutgoingSwipes

export async function deleteSwipe(swipeId: number): Promise<ApiResult<true>> {
    try {
        const response = await fetch(`/api/swipes/${ swipeId }`, { method: "DELETE" });

        if (response.ok) {
            return { status: "success", data: true };
        }

        const data = await response.json();

        throw new Error(data.error);
    } catch (error) {
        console.error(`Error deleting swipe #${ swipeId }:`, error);
        return { status: "error", message: String(error) };
    }
}

export async function getMatches(listingId?: number): Promise<ApiResult<MatchData[]>> {
    try {
        const response = await fetch(`/api/${ listingId ? "listings/" + listingId + "/" : "" }matches`, { method: "GET" });

        if (response.status === 204) {
            return { status: "success", data: null };
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        for (const match of data.data) {
            match.timestamp = dayjs(match.timestamp);
        }
        
        return { status: "success", data: data.data };
    } catch (error) {
        console.error(listingId ? `Error retrieving listing #${ listingId }'s matches:` : "Error retrieving user's matches:", error);
        return { status: "error", message: String(error) };
    }
}

export async function getMatch(matchId: number): Promise<ApiResult<MatchData>> {
    try {
        const response = await fetch(`/api/matches/${ matchId }`, { method: "GET" });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        return { status: "success", data: data.data };
    } catch (error) {
        console.error(`Error retrieving match #${ matchId }:`, error);
        return { status: "error", message: String(error) };
    }
}

export async function deleteMatch(matchId: number): Promise<ApiResult<true>> {
    try {
        const response = await fetch(`/api/matches/${ matchId }`, { method: "DELETE" });

        if (response.ok) {
            return { status: "success", data: true };
        }

        const data = await response.json();

        throw new Error(data.error);
    } catch (error) {
        console.error(`Error deleting match #${ matchId }:`, error);
        return { status: "error", message: String(error) };
    }
}