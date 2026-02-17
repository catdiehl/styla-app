import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface RegionType {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const useCurrentLocation = (): RegionType | null => {
  const [region, setRegion] = useState<RegionType | null>(null);

  useEffect(() => {
    (async () => {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied.');
        // Fallback coordinates if permission is denied
        setRegion({
          latitude: Number(37.78825.toFixed(4)),
          longitude: Number((-122.4324).toFixed(4)),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        return;
      }
      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: Number(location.coords.latitude.toFixed(4)),
        longitude: Number(location.coords.longitude.toFixed(4)),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  return region;
};
