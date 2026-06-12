type WeatherAdvice = {
    suggestion: string;
    items: string[];
    activity: string;
};

export const getClothingAdvice = (tempCelcius: number, condition: string): WeatherAdvice => {
    if (condition === "Tornado" || condition === "Hurricane") {
        return {
            suggestion: "SEVERE WEATHER WARNING!: Take immediate shelter in a basement or interior room.",
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

    if (condition === "Snow"){
        return {
            suggestion:"It's Snowy",
            items:["Heavy Parky", "Thermal layers", "gloves", "A hat", "A scarf", "And waterproof boots"],
            activity:"Building a snowman, Sledding, making snow angels, having a snowball fight, or building a snow fort"
        }
    }

    if (condition === "Haze"){
        return {
            suggestion:"Hazy Weather",
            items:["Air quality mask", "Breathable clothing", "Water"],
            activity:"Stay indoors, Indoor hobbies, Light indoor exercise"
        }
    }

    if (tempCelcius < -5){
        return {
            suggestion:"DANGEROUS FREEZE WARNING!",
            items:["Heavy parka", "Thermal layers", "Gloves", "Hat", "Scarf"],
            activity:"Stay indoors; avoid travel"
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

    if (tempCelcius > 36){
        return {
            suggestion: "DANGEROUS HEAT WARNING!",
            items:["Water", "Sunscreen", "Hat", "Cool clothing"],
            activity:"Stay indoors in AC"
        }
    }

    return {
        suggestion: "It's hot outside!",
        items: ["T-shirt", "Shorts", "Sunglasses", "Sunscreen"],
        activity: "Swimming or beach day"
    };

}