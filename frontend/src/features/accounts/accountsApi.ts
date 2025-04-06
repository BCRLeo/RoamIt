import { PublicUserData, UserData } from "../auth/authApi";
import { Gender } from "./accountsConstants";

export async function signUp(firstName: string, lastName: string, username: string, email: string, password: string, birthday: string, gender: Gender): Promise<UserData | null> {
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

export async function getUserDataFromId(userId: number): Promise<PublicUserData | null> {
    try {
        const response = await fetch (`/api/users/${ userId }`, { method: "GET" });
        const data = await response.json()

        if (response.ok) {
            return data.data;
        }

        throw new Error(data.error);
    } catch (error) {
        console.error(`Error retrieving user #${ userId }'s data:`, error);
    }

    return null;
}

export async function getPublicUserDataFromId(userId: number): Promise<PublicUserData | null> {
    try {
        const response = await fetch (`/api/users/${ userId }?privacy=public`, { method: "GET" });
        const data = await response.json()

        if (response.ok) {
            return data.data;
        }

        throw new Error(data.error);
    } catch (error) {
        console.error(`Error retrieving user #${ userId }'s public data:`, error);
    }

    return null;
}

export async function isEmailAvailable(email: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/users/email/${ email }`, { method: "GET" });

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
        const response = await fetch(`/api/users/email/${ email }`, { method: "GET" });
        const data = await response.json();
        
        if (response.ok) {
            return data.data;
        }

        throw new Error(data.error);
    } catch (error) {
        console.error(`Error retrieving ${ email }'s data:`, error);
    }
    return null;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
    if (username === "") {
        return true;
    }

    try {
        const response = await fetch(`/api/users/username/${ username }`, { method: "GET" });
        
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
        const response = await fetch(`/api/users/username/${ username }`, { method: "GET" });
        const data = await response.json();
        
        if (response.ok) {
            return data.data;
        }

        throw new Error(data.error);
    } catch (error) {
        console.error(`Error retrieving ${ username }'s data:`, error);
    }
    return null;
}

export async function getPublicUserDataFromUsername(username: string): Promise<PublicUserData | null> {
    try {
        const response = await fetch (`/api/users/username/${ username }?privacy=public`, { method: "GET" });
        const data = await response.json()

        if (response.ok) {
            return data.data;
        }

        throw new Error(data.error);
    } catch (error) {
        console.error(`Error retrieving ${ username }'s public data:`, error);
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

        const data = await response.json();

        throw new Error(data.error);
    } catch (error) {
        console.error("Error uploading profile picture:", error);
    }

    return false;
}

export async function getProfilePicture(userIdOrUsername?: number | string): Promise<Blob | null> {
    let possessiveUser = "user";

    switch (typeof(userIdOrUsername)) {
        case "number":
            possessiveUser = `user #${ userIdOrUsername }}`;
            break;
        case "string":
            possessiveUser = userIdOrUsername;
            break;
    }

    try {
        const response = await fetch(`/api/users/${ userIdOrUsername ? `${ userIdOrUsername }/` : "" }profile-picture`, { method: "GET" });

        if (!response.ok) {
            console.error(`Failed to retrieve ${ possessiveUser }$'s profile picture.`);
            return null;
        }

        if (response.status == 204) {
            return null;
        }

        const image = await response.blob()

        return image;
    } catch (error) {
        console.error(`Error retrieving ${ possessiveUser }'s profile picture:`, error);
    }
    
    return null;
}

export async function getProfilePictureUrl(userIdOrUsername?: number | string): Promise<string | null> {
    const image = await getProfilePicture(userIdOrUsername);

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

export async function uploadBio(bio: string) {
    try {
        const response = await fetch("/api/users/bio", {
            method: "POST",
            body: bio
        });
        
        if (response.ok) {
            return true;
        }

        const data = await response.json();

        throw new Error(data.error);
    } catch (error) {
        console.error("Error uploading bio:", error);
    }
    return false;
}

export async function getBio(userIdOrUsername: number | string): Promise<string | null> {
    const possessiveUser = typeof(userIdOrUsername) === "number" ? `user #${ userIdOrUsername }` : userIdOrUsername;

    try {
        const response = await fetch(`/api/users/${ userIdOrUsername }/bio`, { method: "GET" });
        const data = await response.json();

        if (response.ok) {
            return data.data;
        }

        throw new Error(data.error);
    } catch (error) {
        console.error(`Error retrieving ${ possessiveUser }'s bio.`);
    }

    return null;
}

export async function deleteBio() {
    try {
        const response = await fetch("/api/users/bio", { method: "DELETE" });

        if (response.ok) {
            return true;
        }

        const data = await response.json();
        throw new Error(data.error);
    } catch (error) {
        console.error("Error deleting bio:", error);
    }

    return false;
}

export async function uploadTags(tags: string | string[]) {
    if (!Array.isArray(tags)) {
        tags = [tags];
    }

    try {
        const response = await fetch("/api/users/tags", {
            method: "POST",
            body: JSON.stringify(tags),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            return true;
        }

        const data = await response.json();
        console.error("Error uploading tags:", data.error);
    } catch (error) {
        console.error("Error uploading tags:", error);
    }

    return false;
}

export async function getTags(userIdOrUsername: number | string): Promise<string[] | null> {
    const possessiveUser = typeof(userIdOrUsername) === "number" ? `user #${ userIdOrUsername }` : userIdOrUsername;

    try {
        const response = await fetch(`/api/users/${ userIdOrUsername }/tags`, { method: "GET" });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        return data.data;
    } catch (error) {
        console.error(`Error retrieving ${ possessiveUser }'s tags:`, error);
    }

    return null;
}

export async function deleteTags(tags?: string | string[]) {
    if (tags && !Array.isArray(tags)) {
        tags = [tags];
    }

    try {
        const response = await fetch("/api/users/tags", {
            method: "DELETE",
            body: tags ? JSON.stringify(tags) : undefined,
            headers: tags ? {
                "Content-Type": "application/json"
            } : undefined
        });

        if (response.ok) {
            return true;
        }

        const data = await response.json();
        throw new Error(data.error);
    } catch (error) {
        console.error("Error deleting tags:", error);
    }

    return false;
}