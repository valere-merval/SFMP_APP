import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

async function requestAndroidLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);

  return (
    results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
    results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
  );
}

async function requestIosLocationPermission() {
  if (Platform.OS !== 'ios') {
    return true;
  }

  try {
    const status = await Geolocation.requestAuthorization('whenInUse');
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function requestLocationPermission() {
  const iosGranted = await requestIosLocationPermission();
  if (!iosGranted) {
    return false;
  }

  return requestAndroidLocationPermission();
}

async function readCurrentCoordinates(): Promise<Coordinate | null> {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords?.latitude;
        const longitude = position.coords?.longitude;
        if (typeof latitude === 'number' && typeof longitude === 'number') {
          resolve({ latitude, longitude });
          return;
        }
        resolve(null);
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
        showLocationDialog: true,
        forceRequestLocation: true,
      },
    );
  });
}

export async function getCurrentCoordinates(): Promise<Coordinate | null> {
  return readCurrentCoordinates();
}

export async function requestCurrentCoordinates(): Promise<Coordinate | null> {
  const permissionGranted = await requestLocationPermission();
  if (!permissionGranted) {
    return null;
  }

  return readCurrentCoordinates();
}
