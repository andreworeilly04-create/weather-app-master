export interface WeatherData {
    city: { 
        name: string;
        timezone: number;
        displayName?: string;
        customState?: string;
    };

    list: {
        dt:number;
        main: {
            temp: number;
            temp_min:number;
            temp_max:number;
            humidity: number;
            feels_like: number;
            pressure: number;
        }
         weather: {
            main:string;
            description: string;
            icon: string;
        }[];
        wind: {
            speed: number;
        };  
        visibility: number;
    }[];
    
    sys: {
        sunrise: number;
        sunset: number;
    }
}

export interface SavedLocation {
    name: string;
    state: string;
    searchQuery: string;
    lat: number;
    lon: number;
};