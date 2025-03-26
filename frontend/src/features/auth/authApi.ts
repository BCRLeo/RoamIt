interface UserData {
    firstName: string,
    lastName: string,
    username: string,
    email: string
}

export async function getUser(): Promise<UserData | null> {
    try {
        const response = await fetch("/api/session", { method: "GET" });
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
        const response = await fetch("/api/session", {
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
        const response = await fetch("/api/session", { method: "DELETE" });
        const data = await response.json();

        if (!response.ok) {
            console.error(data.error);
            return;
        }
    } catch (error) {
        console.error("Error logging out user:", error);
    }
}

export async function signUp(firstName: string, lastName: string, username: string, email: string, password: string, birthday: string, gender: string): Promise<boolean> {
    try {
        const response = await fetch("/api/user", {
            method: "POST",
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                username: username,
                email: email,
                birthday: birthday,
                password: password,
                gender: gender
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        
        if (!response.ok) {
            console.error(data.error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error("Error signing up user:", error);
    }
    return false;
}