import { PublicUserData, UserData } from "../auth/authApi";

export async function signUp(firstName: string, lastName: string, username: string, email: string, password: string, birthday: string, gender: string): Promise<UserData | null> {
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
            return null;
        }
        
        return data.data;
    } catch (error) {
        console.error("Error signing up user:", error);
    }
    return null;
}

export async function getPublicUserDataFromId(userId: number): Promise<PublicUserData | null> {
    try {
        const response = await fetch (`/api/users/${userId}?privacy=public`, { method: "GET" });
        const data = await response.json()

        if (!response.ok) {
            console.error(data.error);
            return null;
        }

        return data.data;
    } catch (error) {
        console.error(`Error retrieving user #${userId}'s public data:`, error);
    }

    return null;
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

export async function getPublicUserDataFromEmail(email: string): Promise<number | null> {
    try {
        const response = await fetch (`/api/users/email/${email}?privacy=public`, { method: "GET" });
        const data = await response.json()

        if (!response.ok) {
            console.error(data.error);
            return null;
        }

        return data.data;
    } catch (error) {
        console.error(`Error retrieving ${email}'s public data:`, error);
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

export async function getPublicUserDataFromUsername(username: string): Promise<number | null> {
    try {
        const response = await fetch (`/api/users/username/${username}?privacy=public`, { method: "GET" });
        const data = await response.json()

        if (!response.ok) {
            console.error(data.error);
            return null;
        }

        return data.data;
    } catch (error) {
        console.error(`Error retrieving ${username}'s public data:`, error);
    }

    return null;
}

export async function uploadProfilePicture(image: File): Promise<boolean> {
    const formData = new FormData();
    formData.append("file", image);

    try {
        const response = await fetch("/api/users/profile-picture", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            return true;
        }
    } catch (error) {
        console.error("Error uploading profile picture:", error);
    }

    return false;
}

export async function getProfilePicture(userId: number): Promise<Blob | null>
export async function getProfilePicture(username: string): Promise<Blob | null>
export async function getProfilePicture(): Promise<Blob | null>
export async function getProfilePicture(userIdOrUsername?: number | string): Promise<Blob | null> {
    if (userIdOrUsername === undefined) {
        try {
            const response = await fetch("/api/users/profile-picture", { method: "GET" });
            
            if (!response.ok) {
                console.error("Failed to retrieve user's profile picture.");
                return null;
            }
    
            const image = await response.blob()
                
            if (!image) {
                console.error("No image data found for user's profile picture.");
                return null;
            }
    
            return image;
        } catch (error) {
            console.error("Error retrieving user's profile picture:", error);
        }
    
        return null;
    }

    if (typeof(userIdOrUsername) === "number") {
        try {
            const response = await fetch(`/api/users/id-${userIdOrUsername}/profile-picture`, { method: "GET" });

            if (!response.ok) {
                console.error(`Failed to retrieve user #${userIdOrUsername}'s profile picture.`);
                return null;
            }
    
            const image = await response.blob()
                
            if (!image) {
                console.error(`No image data found for user #${userIdOrUsername}'s profile picture.`);
                return null;
            }
    
            return image;
        } catch (error) {
            console.error(`Error retrieving user #${userIdOrUsername}'s profile picture:`, error);
        }
        
        return null;
    } else if (typeof(userIdOrUsername) === "string") {
        try {
            const response = await fetch(`/api/users/username/${userIdOrUsername}/profile-picture`, { method: "GET" });

            if (!response.ok) {
                console.error(`Failed to retrieve user ${userIdOrUsername}'s profile picture.`);
                return null;
            }
    
            const image = await response.blob()
                
            if (!image) {
                console.error(`No image data found for user ${userIdOrUsername}'s profile picture.`);
                return null;
            }
    
            return image;
        } catch (error) {
            console.error(`Error retrieving user ${userIdOrUsername}'s profile picture:`, error);
        }
        
        return null;
    }

    return null;
}

export async function getProfilePictureUrl(userId: number): Promise<string | null>
export async function getProfilePictureUrl(username: string): Promise<string | null>
export async function getProfilePictureUrl(): Promise<string | null>
export async function getProfilePictureUrl(userIdOrUsername?: number | string): Promise<string | null> {
    let image;

    if (userIdOrUsername === undefined) {
        image = await getProfilePicture();
    } else if (typeof(userIdOrUsername) === "number") {
        image = await getProfilePicture(userIdOrUsername);
    } else if (typeof(userIdOrUsername) === "string") {
        image = await getProfilePicture(userIdOrUsername);
    }

    if (!image) {
        return null;
    }

    try {
        return URL.createObjectURL(image);
    } catch (error) {
        console.error("Error retrieving user's profile picture url:", error);
    }

    return null;
}