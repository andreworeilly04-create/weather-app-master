# Weather App 🌤️

A modern weather application built with **Next.js** and **TypeScript** that provides real-time weather information and personalized clothing recommendations based on current weather conditions.

## Features

### 🌦️ Real-Time Weather Data

* Fetches live weather information using the OpenWeather API.
* Displays current temperature, weather conditions, humidity, wind speed, and more.
* Supports location-based weather searches.

### 👕 What to Wear Recommendations

* Intelligent outfit suggestions based on current weather conditions.
* Recommends appropriate clothing items for different temperatures and weather scenarios.
* Helps users decide what to wear before heading outside.

### ⚡ Modern Tech Stack

* Built with Next.js for fast performance and server-side rendering.
* Developed using TypeScript for improved type safety and maintainability.
* Responsive design optimized for desktop and mobile devices.

## Tech Stack

* **Framework:** Next.js
* **Language:** TypeScript
* **Weather API:** OpenWeather API
* **Styling:** CSS
* **Package Manager:** npm / yarn

## Getting Started

### Prerequisites

Before running the project, make sure you have:

* Node.js installed
* An OpenWeather API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/andreworeilly04-create/weather-app-master.git
```

2. Navigate to the project directory:

```bash
cd weather-app-master
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_WEATHER_API_KEY=a0f9e4f2471503620d34eef5966be77f
```

5. Start the development server:

```bash
npm run dev
```

6. Open your browser and visit:

```text
http://localhost:3000
```

## How It Works

1. The user enters a city or location.
2. The application requests weather data from the OpenWeather API.
3. Weather information is displayed in an easy-to-read format.
4. Based on the temperature and weather conditions, the app generates clothing and outfit recommendations.
5. Users receive practical advice such as:

   * Wear a light t-shirt and shorts on hot days.
   * Bring a jacket during cooler temperatures.
   * Carry an umbrella when rain is expected.
   * Layer clothing during cold weather.

## Project Structure

```text
src/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   └── page.tsx
├── types/
|  |-- weather.tsx
├── utils/
|  |-- weatherAdvice.tsx


## Environment Variables

```env
NEXT_PUBLIC_WEATHER_API_KEY=a0f9e4f2471503620d34eef5966be77f
```

## Future Improvements

* 7-day weather forecasts
* Geolocation support
* Weather alerts and notifications
* Saved favorite locations
* Enhanced outfit recommendations based on activity level
* Dark mode support

## Acknowledgements

* OpenWeather for providing weather data.
* Next.js team for the excellent React framework.
* TypeScript for type-safe development.

## License

This project is licensed under the MIT License.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
