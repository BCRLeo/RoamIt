export type PublicUserData  = {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
};

export type UserData = PublicUserData & { email: string };

export async function getCurrentUser(): Promise<UserData | null> {
    try {
        const response = await fetch("/api/sessions", { method: "GET" });
        const data = await response.json();

        if (!response.ok) {
            console.error(data.error);
            return null;
        }

        return data.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
    return null;
}

export async function logIn(login: string, password: string): Promise<UserData | null> {
    try {
        const response = await fetch("/api/sessions", {
            method: "POST",
            body: JSON.stringify({ login: login, password: password }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();

        if (!response.ok) {
            console.error(data.error);
            return null;
        }

        return data.data;
    } catch (error) {
        console.error("Error logging in user:", error);
    }
    return null;
}

export async function logOut() {
    try {
        const response = await fetch("/api/sessions", { method: "DELETE" });

        if (response.ok) {
            return;
        }

        const data = await response.json();

        throw new Error(data.error);
    } catch (error) {
        console.error("Error logging out user:", error);
    }
}