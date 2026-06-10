type WeatherAdvice = {
    suggestion: string;
    items: string[];
    activity: string;
};

export const getClothingAdvice = (tempCelcius: number, condition: string,): WeatherAdvice => {
    if (condition === "Tornado" || condition === "Hurricane") {
        return {
            suggestion: "TORNADO WARNING: Take immediate shelter in a basement or interior room.",
            items: ["Emergency kit", "Sturdy shoes"],
            activity: "Stay indoors/Shelter"
        }

    }

    if (condition === "Thunderstorm") {
        return {
            suggestion: "Thunderstorm warning",
            items: ["Indoor gear"],
            activity: "Indoor only"
        }
    }

    if (condition === "Rain" || condition === "Drizzle") {
        return {
            suggestion: "It's wet outside",
            items: ["Waterproof jacket", "Umbrella"],
            activity: "Indoor"
        }
    }


    if (tempCelcius < 10) {
        return {
            suggestion: "It's freezing! Bundle up",
            items: ["Heavy coat", "Thermal base layer", "Scarf", "Gloves"],
            activity: "Indoor"
        };
    }
    if (tempCelcius < 20) {
        return {
            suggestion: "It's chilly, better layer up",
            items: ["Light jacket", "Sweater", "Long pants"],
            activity: "Brisk walk"
        }
    }

    if (tempCelcius < 28) {
        return {
            suggestion: "Comfortable weather",
            items: ["T-shirt", "Light pants or jeans"],
            activity: "Casual outdoor walk"
        };
    }

    return {
        suggestion: "It's hot outside!",
        items: ["T-shirt", "Shorts", "Sunglasses", "Sunscreen"],
        activity: "Swimming or beach day"
    };

}