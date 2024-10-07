import { Image, StyleSheet, Platform, Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Slot, Stack } from 'expo-router';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { FlatList } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const Forecast_URL = `https://api.openweathermap.org/data/2.5/forecast`;
const BASE_URL = `https://api.openweathermap.org/data/2.5/weather`;
const API_KEY = '1c740173f7ce976296f9a5b82d75804d';

type MainWeather = {
  temp: number;
  feels_like: number,
  temp_min: number,
  temp_max: number,
  pressure: number,
  humidity: number,
  sea_level: number,
  grnd_level: number
};

type Weather = {
  name: string;
  main: MainWeather
};

type Forecast = {
  dt: number;
  main: MainWeather
  dt_txt: string;
};

export default function HomeScreen() {

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [weather, setWeather] = useState<Weather>();
  const [forecast, setForecast] = useState<Forecast[]>();


  useEffect(() => {
    if (location) {
    fetchWeather();
    fetchForecast();
    }
  }, [location] ); 

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  },[]);

  
  const fetchWeather =async () => {
    if (!location) {
      return;
    }
    const lat = location?.coords.latitude;
    const lon = location?.coords.longitude;

    const results = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const data = await results.json();
    setWeather(data);
  }

  const fetchForecast = async () => {
    if (!location) {
      return;
    }
    const lat = location?.coords.latitude;
    const lon = location?.coords.longitude;
    const cnt = 7;
    const results = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&cnt=${cnt}&appid=${API_KEY}&units=metric`);
    const data = await results.json();
    setForecast(data.list);
  }

  if (!weather) {
    return <ActivityIndicator />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.location}>{weather.name}</Text>
      <Text style={styles.temp}>{Math.round(weather.main.temp)} °C</Text>

      <FlatList 
        data={forecast}
        renderItem={({item}) => (
          <View>
            <Text>{Math.round(item.main.temp)} °C</Text>
          </View>
        )}
      />
    
    </GestureHandlerRootView>
  );
};
    


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  location: {
    fontFamily: 'InterSemi',
    fontSize: 30,
  },
  temp: {
    fontFamily: 'InterSemi',
    fontSize: 40,
    color: 'gray',
  },
});
