import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import FastImage from 'react-native-fast-image';

import { getWeatherData, getWeatherDataByCity } from './WeatherAPI';
import SearchLocation from './SearchLocation';

import { FontAwesome5 } from '@expo/vector-icons';

const App = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null); // Initially null
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Fetch weather by current location on app load
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const weather = await getWeatherData(location.coords.latitude, location.coords.longitude);
      setWeatherData(weather);
      setIsLoading(false);
    })();
  }, []);

  // Function to handle city search
  const handleCitySearch = async (city: string) => {
    setIsLoading(true);
    const weather = await getWeatherDataByCity(city);
    if (weather) {
      setWeatherData(weather);
      setLocation(null); // Clear the location since the user searched for a city
    }
    setIsLoading(false);
  };

  interface WeatherData {
    weather: { main: string; description: string }[]; // Array of weather conditions
    main: {
      temp: number;
      temp_max: number; // Maximum temperature
      temp_min: number; // Minimum temperature
      humidity: number; // Humidity percentage
      sea_level: number; // Sea level pressure
    };
    wind: { speed: number }; // Wind speed
    sys: { sunrise: number; sunset: number }; // Sunrise and sunset times
    name: string; // City name
  }

  const getWeatherAnimation = (weather: WeatherData) => {
    const currentTime = Date.now() / 1000; // Current time in seconds
    const sunriseTime = weather.sys.sunrise;
    const sunsetTime = weather.sys.sunset;
    const isDaytime = currentTime >= sunriseTime && currentTime < sunsetTime;
    
  
    switch (weather?.weather[0]?.main) {
      case 'Clear':
      case 'Sunny':
      case 'Clear Sky':
        return isDaytime
          ? require('./assets/animations/sun.json') // Daytime sun animation
          : require('./assets/animations/moon.json'); // Nighttime clear sky animation
  
      case 'Clouds':
      case 'Partly Clouds':
      case 'Overcast':
      case 'Mist':
      case 'Foggy':
        return isDaytime
          ? require('./assets/animations/cloud.json')  // Daytime cloud animation
          : require('./assets/animations/cloud.json'); // Nighttime cloud animation
  
      case 'Rain':
      case 'Moderate Rain':
      case 'Showers':
      case 'Heavy Rain':
      case 'Light Rain':
      case 'Drizzle':
        return isDaytime
          ? require('./assets/animations/rain.json') // Daytime rain animation
          : require('./assets/animations/rain.json'); // Nighttime rain animation
  
      case 'Thunderstorm':
        return isDaytime
          ? require('./assets/animations/thunder.json')  // Daytime thunderstorm animation
          : require('./assets/animations/thunder.json'); // Nighttime thunderstorm animation
  
      case 'Light Snow':
      case 'Moderate Snow':
      case 'Heavy Snow':
      case 'Blizzard':
        return isDaytime
          ? require('./assets/animations/snow.json') // Daytime snow animation
          : require('./assets/animations/snow.json'); // Nighttime snow animation
  
      default:
        return isDaytime
          ? require('./assets/animations/sun.json')  // Daytime default animation
          : require('./assets/animations/moon.json'); // Nighttime default animation
    }
  };
  
  


  const getBackgroundGif = (weather: WeatherData) => {
    const currentTime = Date.now() / 1000; // Current time in seconds
    const sunriseTime = weather.sys.sunrise;
    const sunsetTime = weather.sys.sunset;
  
    const isDaytime = currentTime >= sunriseTime && currentTime < sunsetTime;
  
    switch (weather?.weather[0]?.main) {
      case 'Clear':
      case 'Sunny':
      case 'Clear Sky':
        return isDaytime ? require('./assets/gifs/sunnylong.gif') : require('./assets/gifs/night_sky.gif');
  
      case 'Clouds':
      case 'Partly Clouds':
      case 'Overcast':
      case 'Mist':
      case 'Foggy':
        return isDaytime ? require('./assets/gifs/cloudy_medium.gif') : require('./assets/gifs/night_cloud.gif');
  
      case 'Rain':
      case 'Moderate Rain':
      case 'Showers':
      case 'Heavy Rain':
        return isDaytime ? require('./assets/gifs/rain_morning.gif') : require('./assets/gifs/rain_heavy.gif');
  
      case 'Drizzle':
      case 'Light Rain':
        return isDaytime ? require('./assets/gifs/drizzle_morning.gif') : require('./assets/gifs/drizzle.gif');
  
      case 'Thunderstorm':
        return isDaytime ? require('./assets/gifs/thunderstorm.gif') : require('./assets/gifs/thunderstorm.gif');
  
      case 'Light Snow':
      case 'Moderate Snow':
      case 'Heavy Snow':
      case 'Blizzard':
        return isDaytime ? require('./assets/gifs/snow_medium.gif') : require('./assets/gifs/snow_night.gif');
  
      default:
        return isDaytime ? require('./assets/gifs/sunnylong.gif') : require('./assets/gifs/night_sky.gif');
    }
  };
  
  

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!weatherData) {
    return <Text>Error fetching weather data</Text>;
  }


  const formatUnixTime = (unixTime: number) => {
    const date = new Date(unixTime * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <View style={styles.container}>
      {/* GIF Background */}
      <FastImage
        style={styles.backgroundImage}
        source={getBackgroundGif(weatherData)}
        resizeMode={FastImage.resizeMode.cover}
      />

      {/* Lottie Animation for Weather */}
      <LottieView
        source={getWeatherAnimation(weatherData)}
        style={styles.weatherAnimation}
        autoPlay
        loop
      />

      {/* Weather Info */}
      <View style={styles.weatherInfo}>
        <Text style={styles.location}>{weatherData.name}</Text>
        <Text style={styles.temperature}>{Math.round(weatherData.main.temp)}°C</Text>
        <Text style={styles.description}>{weatherData.weather[0].description}</Text>

        {/* Additional Weather Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <FontAwesome5 name="thermometer-half" size={24} color="white" />
            <Text style={styles.detailText}>Max Temp: {Math.round(weatherData.main.temp_max)}°C</Text>
          </View>

          <View style={styles.detailRow}>
            <FontAwesome5 name="thermometer-empty" size={24} color="white" />
            <Text style={styles.detailText}>Min Temp: {Math.round(weatherData.main.temp_min)}°C</Text>
          </View>

          <View style={styles.detailRow}>
            <FontAwesome5 name="water" size={24} color="white" />
            <Text style={styles.detailText}>Humidity: {weatherData.main.humidity}%</Text>
          </View>

          <View style={styles.detailRow}>
            <FontAwesome5 name="wind" size={24} color="white" />
            <Text style={styles.detailText}>Wind Speed: {weatherData.wind.speed} m/s</Text>
          </View>

          <View style={styles.detailRow}>
            <FontAwesome5 name="sun" size={24} color="white" />
            <Text style={styles.detailText}>Sunrise: {formatUnixTime(weatherData.sys.sunrise)}</Text>
          </View>

          <View style={styles.detailRow}>
            <FontAwesome5 name="moon" size={24} color="white" />
            <Text style={styles.detailText}>Sunset: {formatUnixTime(weatherData.sys.sunset)}</Text>
          </View>

          <View style={styles.detailRow}>
            <FontAwesome5 name="water" size={24} color="white" />
            <Text style={styles.detailText}>Sea Level: {weatherData.main.sea_level} hPa</Text>
          </View>
        </View>
      </View>

      {/* Search Location Component */}
      <SearchLocation onSearch={handleCitySearch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  weatherInfo: {
    zIndex: 1,
    alignItems: 'center',
  },
  temperature: {
    fontSize: 48,
    color: '#fff',
  },
  description: {
    fontSize: 24,
    color: '#fff',
  },
  location: {
    fontSize: 18,
    color: '#fff',
  },
  details: {
    marginTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  detailText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  // Lottie animation styling
  weatherAnimation: {
    width: 150,  // Adjust width according to the desired size
    height: 150, // Adjust height accordingly
    marginBottom: 20, // Adds spacing between the animation and other elements
    zIndex: 1,    // Ensures the animation appears above the background
  },
});


export default App;
  

  