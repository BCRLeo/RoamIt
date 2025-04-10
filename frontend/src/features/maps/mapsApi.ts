export async function getLocationData(latitude: number, longitude: number, shortenCountryCode: boolean = true): Promise<{ country: string | null, locality: string | null } | null> {
    let country: string | null = null;
    let locality: string | null = null;

    try {
        if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
            throw Error(`Latitude and longitude must fall within [-90, 90] and [-180, 180] respectively.`);
        }

        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${ latitude },${ longitude }&key=${ process.env.GOOGLE_API_KEY }`);

        if (!response.ok) {
            throw Error(response.status.toString());
        }

        const data = await response.json();

        if (data["status"] !== "OK" || !data["results"].length) {
            throw Error(data["status"]);
        }

        for (const result of data["results"]) {
            for (const component of result["address_components"]) {
                if (!country && result["types"].includes("country") && component["short_name"]) {
                    country = component[shortenCountryCode ? "short_name" : "long_name"];
                }
    
                if (!locality && result["types"].includes("locality") && component["long_name"]) {
                    locality = component["long_name"];
                }
            }
        }

        if (!country && !locality) {
            throw Error("No country or locality found.");
        }

        return {
            country: country,
            locality: locality
        }
    } catch (error) {
        console.error(`Failed to retrieve location data for (${ latitude }, ${ longitude }):`, error);
        return null;
    }   
}