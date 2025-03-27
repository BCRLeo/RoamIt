interface UserData {
    firstName: string,
    lastName: string,
    username: string,
    email: string
}

export async function getUser(): Promise<UserData | null> {
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
        const response = await fetch("/api/users", {
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

export async function isEmailAvailable(email: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/users/email/${email}`, { method: "GET" });

        if (response.status == 404) {
            return true;
        }
    } catch (error) {
        console.error("Error checking email availability:", error);
    }
    return false;
}

export async function getUserFromEmail(email: string): Promise<UserData | null> {
    try {
        const response = await fetch(`/api/users/email/${email}`, { method: "GET" });
        const data = await response.json();
        
        if (!response.ok) {
            console.error(data.error);
            return null;
        }

        return data.data;
    } catch (error) {
        console.error(`Error retrieving user with email ${email}:`, error);
    }
    return null;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
    if (username === "") {
        return true;
    }

    try {
        const response = await fetch(`/api/users/username/${username}`, { method: "GET" });
        
        if (response.status === 404) {
            return true;
        }
    } catch (error) {
        console.error("Error checking username availability:", error);
    }
    return false;
}

export async function getUserFromUsername(username: string): Promise<UserData | null> {
    try {
        const response = await fetch(`/api/users/username/${username}`, { method: "GET" });
        const data = await response.json();
        
        if (!response.ok) {
            console.error(data.error);
            return null;
        }

        return data.data;
    } catch (error) {
        console.error(`Error retrieving user with username ${username}:`, error);
    }
    return null;
}