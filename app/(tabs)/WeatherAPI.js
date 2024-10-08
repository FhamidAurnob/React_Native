import axios from 'axios';

const API_KEY = '1c740173f7ce976296f9a5b82d75804d'; // Replace with your OpenWeather API key

// Function to get weather data by latitude and longitude (Current location)
export const getWeatherData = async (latitude, longitude) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Function to get weather data by city name (Search functionality)
export const getWeatherDataByCity = async (city) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
