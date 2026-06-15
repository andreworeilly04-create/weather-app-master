'use client'
import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { WeatherData, SavedLocation } from '@/types/weather';
import { getClothingAdvice } from '../utils/weatherAdvice'
import './globals.css'

interface GeoSuggestion {
  name: string;
  state?: string;
  searchQuery: string;
  country: string;
  lat: number;
  lon: number;
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [fahrenheit, setFahrenheit] = useState<boolean>(true);
  const [isMiles, setIsMiles] = useState<boolean>(false);
  const [isSpeed, setIsSpeed] = useState<boolean>(false);
  const [isPressure, setIsPressure] = useState<boolean>(false);
  const [suggestionsList, setSuggestionsList] = useState<GeoSuggestion[]>([]);
  const [timeCategory, setTimeCategory] = useState('');
  const [hourlyData, setHourlyData] = useState<any[]>([])
  const [weatherCondition, setWeatherCondition] = useState('clear');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mySavedLocations");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  })

  useEffect(() => {
    localStorage.setItem("mySavedLocations", JSON.stringify(savedLocations));
  }, [savedLocations]);

  // Accurate dynamic timezone calculation using absolute UTC math
  useEffect(() => {
    const updateTimeCategory = () => {
      if (!weather?.city?.sunrise || !weather?.city?.sunset || weather.city.timezone === undefined) return;

      const { sunrise, sunset, timezone } = weather.city;
      const nowutc = Math.floor(Date.now() / 1000);
      const localSolarTime = (nowutc + timezone);
      const localSunrise = sunrise + timezone;
      const localSunset = sunset + timezone;
      const dayLength = localSunset - localSunrise;
      const solarNoon = localSunrise + (dayLength / 2);
      const afternoonBuffer = dayLength * 0.20;

      if (localSolarTime < localSunrise || localSolarTime > localSunset) {
        setTimeCategory('night');
      } else if (localSolarTime < solarNoon - afternoonBuffer) {
        setTimeCategory('morning');
      } else if (localSolarTime > solarNoon + afternoonBuffer) {
        setTimeCategory('evening');
      } else {
        setTimeCategory('afternoon');
      }
    }

    updateTimeCategory();
    const interval = setInterval(updateTimeCategory, 60000);
    return () => clearInterval(interval);
  }, [weather]);

  useEffect(() => {
    if (!weather?.list || weather.list.length === 0 || !weather.list[0].weather || weather.list[0].weather.length === 0) return;
    const condition = weather.list[0].weather[0].main;
    setWeatherCondition(condition)
  }, [weather])

  const wrapperRef = useRef<HTMLDivElement>(null)
  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  const unit = fahrenheit ? 'F' : 'C';

  const fetchWeatherByCoords = async (lat: number, lon: number, customState?: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
      );
      const data = await response.json();

      if (data && data.list) {
        setWeather({ ...data, customState: customState || "" });
        setHourlyData(data.list);
      }
    } catch (error) {
      console.error("Error fetching weather by coordinates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (input: string | SavedLocation) => {
    if (typeof input === 'string' && input.trim().length === 0) {
      alert("Please enter a location");
      return;
    }
    setLoading(true);
    try {
      if (typeof input !== 'string') {
        await fetchWeatherByCoords(input.lat, input.lon, input.state);
        return;
      }
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(input)}&limit=1&appid=${API_KEY}`
      );

      if (!geoResponse.ok) {
        throw new Error("Failed to fetch location");
      }
      const geoData = await geoResponse.json();

      if (geoData.length > 0) {
        const { lat, lon, state } = geoData[0];
        await fetchWeatherByCoords(lat, lon, state);
      } else {
        alert("City not found")
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        () => {
          handleSearch("Longwood");
        }
      );
    } else {
      handleSearch("Longwood");
    }
  }, []);

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestionsList([]);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
        );
        const data: GeoSuggestion[] = await res.json();
        setSuggestionsList(data);
        setIsOpen(data.length > 0);
      } catch (err) {
        console.error("Error fetching autocomplete suggestions:", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, API_KEY]);

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestionsList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestionsList.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestionsList.length - 1))
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestionsList.length) {
        selectSuggestion(suggestionsList[activeIndex]);
      } else {
        if (query.trim() === "") return;
        try {
          await handleSearch(query);
          setQuery("");
        } catch (err) {
          console.error("Search failed:", err)
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectSuggestion = (location: GeoSuggestion) => {
    const displayName = `${location.name}${location.state ? `, ${location.state}` : `, ${location.country}`}`;
    setQuery(displayName);
    setSuggestionsList([]);
    setActiveIndex(-1);
    setQuery("");
    isOpen && setIsOpen(false);

    fetchWeatherByCoords(location.lat, location.lon, location.state || location.country);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!weather || !weather.list || weather.list.length === 0) return <div className="not__found">City not found.</div>;

  const current = weather.list[0];
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const twentyFourHoursFromNow = currentTimestamp + 86400;

  const next24HoursForecasts = weather.list.filter(item => {
    return item.dt >= currentTimestamp && item.dt <= twentyFourHoursFromNow;
  });

  const datasetForHighLow = next24HoursForecasts.length > 0 ? next24HoursForecasts : weather.list.slice(0, 8);
  const temps = datasetForHighLow.map(item => item.main.temp);
  const trueHigh = Math.max(...temps);
  const trueLow = Math.min(...temps);

  const temp = current.main.temp;
  const humidity = current.main.humidity;
  const feels_like = current.main.feels_like;
  const wind = current.wind.speed;
  const visibility = current.visibility;
  const pressure = current.main.pressure;

  const currentUtcTimestamp = Math.floor(Date.now() / 1000);
  const cityLocalTimestamp = (currentUtcTimestamp + weather.city.timezone) * 1000;
  const localDate = new Date(cityLocalTimestamp);

  const formattedTime = localDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });

  const todaysDate = localDate.toLocaleTimeString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });

  let temperatureClass = 'weather-warm';
  if (temp <= 32) {
    temperatureClass = 'weather-freezing';
  } else if (temp > 32 && temp <= 65) {
    temperatureClass = 'weather-cold';
  } else if (temp > 65 && temp <= 85) {
    temperatureClass = 'weather-warm';
  } else if (temp > 85) {
    temperatureClass = 'weather-hot'
  }

  const removeLocation = (locationToRemove: SavedLocation) => {
    setSavedLocations((prev) =>
      prev.filter(loc => loc.name !== locationToRemove.name || loc.state !== locationToRemove.state)
    );
  };

  const toggleSaved = (suggestion: SavedLocation) => {
    setSavedLocations((prev) => {
      const exists = prev.find(
        (item) => item.lat === suggestion.lat && item.lon === suggestion.lon
      );
      return exists
        ? prev.filter(
          (item) => item.lat !== suggestion.lat || item.lon !== suggestion.lon
        )
        : [...prev, suggestion];
    });
  };

  const dailyForecast = weather.list.reduce((acc: any, item: any) => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];

    if (!acc[date]) {
      acc[date] = {
        temps: [],
        conditions: [],
        windSpeeds: [],
        descriptions: [],
        mainConditions: [],
        pressures: [],
        humidities: [],
        visibility: [],
        pops: [] // Track probability of precipitation array
      };
    }

    acc[date].temps.push(item.main.temp);
    acc[date].conditions.push(item.weather[0].icon)
    acc[date].windSpeeds.push(item.wind.speed);
    acc[date].descriptions.push(item.weather[0].description);
    acc[date].mainConditions.push(item.weather[0].main);
    acc[date].pressures.push(item.main.pressure);
    acc[date].humidities.push(item.main.humidity);
    acc[date].visibility.push(item.visibility);
    acc[date].pops.push(item.pop ?? 0); // OpenWeather maps 'pop' from 0 to 1

    return acc;
  }, {} as Record<string, { temps: number[], conditions: string[], windSpeeds: number[], descriptions: string[], mainConditions: string[], pressures: number[], humidities: number[], visibility: number[], pops: number[] }>)

  const forecastDates = Object.keys(dailyForecast).sort();
  const upcomingDates = forecastDates.slice(1);

  const currentTemp = weather?.list?.[0]?.main.temp ?? 0;
  const tempCelcius = (currentTemp - 32) * 5 / 9;
  const currentCondition = weather?.list?.[0]?.weather?.[0]?.main ?? "Clear";
  const advice = getClothingAdvice(tempCelcius, currentCondition);

  const getDetailedDayAdvice = (dateString: string) => {
    const dayData = dailyForecast[dateString];
    if (!dayData) return { suggestion: "", items: [], activity: "" };

    const dayHighFahrenheit = Math.max(...dayData.temps);
    const dayHighCelsius = ((dayHighFahrenheit - 32) * 5) / 9;
    const primaryCondition = dayData.mainConditions[0] || "Clear";

    return getClothingAdvice(dayHighCelsius, primaryCondition);
  };

  const getIconUrl = (apiIcon: string) => {
    if (timeCategory === 'night' && apiIcon.endsWith('d')) {
      return apiIcon.replace('d', 'n');
    }
    return apiIcon;
  }

  const enrichForecast = (data: any) => {
    const enriched = { ...data };
    Object.keys(enriched).forEach((date) => {
      const mainCondition = enriched[date].mainConditions[0]?.toLowerCase() || '';
      
      enriched[date].isRainy = ['rain', 'thunderstorm', 'drizzle', 'snow'].some(condition => 
        mainCondition.includes(condition)
      );
      
      // Calculate max probability of precipitation across the 3-hour interval slices
      const maxPop = Math.max(...enriched[date].pops);
      enriched[date].popPercentage = Math.round(maxPop * 100);
    });
    return enriched;
  };

  const enrichedForecast = enrichForecast(dailyForecast);

  return (
    <>
      <div className={`app-container bg-${timeCategory} bg-${weatherCondition}`}>
        <div ref={wrapperRef} className="search__location--container">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            className="search__location"
            type="text"
            placeholder="Search City and State"
            onKeyDown={handleKeyDown}
          />
          <button onClick={() => handleSearch(query)} className="search__btn">Search Location</button>
        </div>

        {isOpen && ((query === "" && savedLocations.length > 0) || (query !== "" && suggestionsList.length > 0)) && (
          <div className="suggestions__list--container">
            {query === "" && savedLocations.length > 0 && (
              <>
                <h3 className="dropdown-header">Saved Locations</h3>
                {savedLocations.map((loc: SavedLocation) => (
                  <div key={`${loc.lat}-${loc.lon}`}
                    className="suggestion-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearch(loc);
                      setIsOpen(false);
                      setQuery("");
                    }}
                  >
                    <h3 className="saved_location">
                      {loc.name}, {loc.state}
                    </h3>
                    <button onClick={(e) => { e.stopPropagation(); removeLocation(loc); }} className="remove_saved_location">Remove Location</button>
                  </div>
                ))}
              </>
            )}

            {query !== "" && suggestionsList.map((suggestion, index) => {
              const uniqueId = `${suggestion.name}-${suggestion.state}-${suggestion.lat}-${suggestion.lon}`;
              const isSaved = savedLocations.some((loc) => loc.name === suggestion.name && loc.state === suggestion.state);
              const label = `${suggestion.name}${suggestion.state ? `, ${suggestion.state}` : `, ${suggestion.country}`}`;
              return (
                <div
                  key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                  className={index === activeIndex ? "active-suggestion" : "suggestion-item"}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <div className="suggested_city_and_state--container">
                    <h3 className="suggested_city_and_state">{label}</h3>
                    <button key={uniqueId} onClick={(e) => { e.stopPropagation(); toggleSaved({ name: suggestion.name, state: suggestion.state ?? "", searchQuery: suggestion.searchQuery ?? "", lat: suggestion.lat, lon: suggestion.lon }) }} className="add__location">{isSaved ? "Remove Location" : "Add Location"}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={`city__container ${temperatureClass}`}>
          <div className="button__container">
          <div className="pressure_and_speed">
            <button onClick={() => setIsPressure(!isPressure)} className="barometer_convert">{isPressure ? 'inHg' : 'hPa'}</button>
            <button onClick={() => setIsSpeed(!isSpeed)} className="wind_speed_convert">{isSpeed ? 'km/h' : 'mph'}</button>
            </div>
            <div className="miles_and_temp">
            <button onClick={() => setIsMiles(!isMiles)} className="miles_convert">{isMiles ? "km" : "mi"}</button>
            <button onClick={() => setFahrenheit(!fahrenheit)} className="temp_convert">{fahrenheit ? "F" : "C"}</button>
            </div>
          </div>
          <h2 className="todays_date">{todaysDate}</h2>
          <h1 className="city_and_state">{weather.city.name}{weather.city.customState ? `, ${weather.city.customState}` : ""}</h1>
          <h3 className="temperature">{Math.round(fahrenheit ? temp : (temp - 32) * 5 / 9)}&deg; {fahrenheit ? "F" : "C"}</h3>
          <div className="hi_and_lo--container">
            <h2 className="hi">Hi: {Math.round(fahrenheit ? trueHigh : (trueHigh - 32) * 5 / 9)}&deg; {fahrenheit ? "F" : "C"} </h2> <h2 className="lo">Lo: {Math.round(fahrenheit ? trueLow : (trueLow - 32) * 5 / 9)}&deg; {fahrenheit ? "F" : "C"}</h2>
          </div>
          <div className="weather_icon--container">
          <img className="weather_icon" src={`https://openweathermap.org/img/wn/${getIconUrl(weather.list[0].weather[0].icon)}@2x.png`} alt={weather.list[0].weather[0].description} />
          </div>
          <p className="condition">{weather.list[0].weather[0].description}</p>
          <p className="updated">Updated as of {formattedTime}</p>
        </div>

        <div className="status__container">
          <h3 className="feels_like">Feels Like: {Math.round(fahrenheit ? feels_like : (feels_like - 32) * 5 / 9)}&deg;{fahrenheit ? "F" : "C"} </h3>
          <h3 className="wind">Wind: {isSpeed ? Math.round(wind * 1.60934) + " km/h" : Math.round(wind) + " mph"}</h3>
          <h3 className="visibility">Visibility: {isMiles ? Math.round(visibility * 1.60934) + " km" : Math.round(visibility) + " mi"}</h3>
          <h3 className="barometer">Barometer: {isPressure ? (pressure * 0.02953).toFixed(2) + ' inHg' : Math.round(pressure) + " hPa"}</h3>
          <h3 className="humidity">Humidity: {Math.round(humidity)}%</h3>
        </div>

        <div className="advice__container">
          <h2 className="suggestion">{advice.suggestion}</h2>
          <ul className="advice">
            <h2 className="what_to_wear">What you will need:</h2>
            {advice.items.map((item, index) => (
              <li className="items" key={index}>{item}</li>
            ))}
          </ul>
          <h2 className="activity"><strong>Activity: </strong>{advice.activity}</h2>
        </div>

        <div className="daily__container">
          <h2 className="daily">Daily</h2>
          <div className="forecast__container">
            {upcomingDates.map((date) => {
              const { isRainy, popPercentage } = enrichedForecast[date];
              return (
                <div className="forecast" key={date} onClick={() => setSelectedDate(date)}>
                  <p className="day">{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  {isRainy && popPercentage > 0 && (
                    <div className="weather-card__precipitation">
                      <span className="precipitation__value">{popPercentage}%</span>
                    </div>
                  )}
                  <div className="weather_icon--container">
                  <img className="weather_icon" src={`https://openweathermap.org/img/wn/${dailyForecast[date].conditions[0]}@2x.png`} alt={weather.list[0].weather[0].description} />
                  </div>
                  <p className="daily_temperature">{fahrenheit ? Math.round(Math.max(...dailyForecast[date].temps)) : Math.round((Math.max(...dailyForecast[date].temps) - 32) * 5 / 9)}&deg;{unit} {fahrenheit ? Math.round(Math.min(...dailyForecast[date].temps)) : Math.round((Math.min(...dailyForecast[date].temps) - 32) * 5 / 9)}&deg;{unit}</p>
                </div>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="forecast-details">
            <h3 className="detailed_forecast">Detailed Forecast for {new Date(selectedDate).toLocaleDateString()}</h3>
            <p className="forecast_condition">Condition: {dailyForecast[selectedDate].descriptions[0]}</p>
            <p className="forecast_wind_speed">Wind Speed: {isSpeed ? Math.round(wind * 1.60934) + " km/h" : dailyForecast[selectedDate].windSpeeds[0] + " mph"}</p>
            <p className="forecast_barometer">Barometer: {isPressure ? (dailyForecast[selectedDate].pressures[0] * 0.02953).toFixed(2) + ' inHg' : Math.round(dailyForecast[selectedDate].pressures[0]) + " hPa"}</p>
            <p className="forecast_humidity">Humidity: {Math.round(dailyForecast[selectedDate].humidities[0])}%</p>
            <p className="forecast_visibility">Visibility: {isMiles ? (dailyForecast[selectedDate].visibility[0] * 1.60934).toFixed(1) + " km" : dailyForecast[selectedDate].visibility[0] + " mi"}</p>
            <p className="forecast_hi">Hi: {fahrenheit ? Math.round(Math.max(...dailyForecast[selectedDate].temps)) : Math.round((Math.max(...dailyForecast[selectedDate].temps) - 32) * 5 / 9)}&deg; {fahrenheit ? "F" : "C"}</p>
            <p className="forecast_lo">Lo: {fahrenheit ? Math.round(Math.min(...dailyForecast[selectedDate].temps)) : Math.round((Math.min(...dailyForecast[selectedDate].temps) - 32) * 5 / 9)}&deg; {fahrenheit ? "F" : "C"}</p>

            <div className="forecast__advice__container">
              {(() => {
                const dayAdvice = getDetailedDayAdvice(selectedDate);
                return (
                  <>
                    <p className="forecast__suggestion">{dayAdvice.suggestion}</p>
                    <ul className="forecast__advice">
                      <h2 className="forecast_what_to_wear">What you will need:</h2>
                      {dayAdvice.items.map((item: string, index: number) => (
                        <li className="forecast_items" key={index}>{item}</li>
                      ))}
                    </ul>
                  </>
                );
              })()}
              <button className="close_details" onClick={() => setSelectedDate(null)}>Close details</button>
            </div>
          </div>
        )}

        <h2 className="hourly">Hourly</h2>
        <div className="hourly-container">
          <div className="hourly-card">
            <div className="hours__container">
              {hourlyData && hourlyData.length > 0 ? (
                hourlyData.slice(0, 8).map((hour, index) => {
                  const localCityTimestamp = (hour.dt + weather.city.timezone) * 1000;
                  const cityDate = new Date(localCityTimestamp);
                  const hourlyFormattedTime = cityDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC',

                  });
                  const isRainy = ['rain', 'thunderstorm', 'drizzle'].some(condition => hour.weather[0]?.main?.toLowerCase().includes(condition))
                  const popPercentage = Math.round((hour.pop || 0) * 100);
                  return (
                    <div className="hours" key={index}>
                      <img src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`} alt={hour.weather[0].description} />
                      <span className="hourly-time">{hourlyFormattedTime}</span>
                      <span className="hourly-temp">{Math.round(fahrenheit ? hour.main.temp : (hour.main.temp - 32) * 5 / 9)}&deg; {fahrenheit ? "F" : "C"}</span>
                      {isRainy && popPercentage > 0 && (
                        <div className="weather-card_precipitation">
                          <span className="precipitation_value">{popPercentage}%</span>
                          </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="loading_hourly_forecast">Loading hourly data...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
