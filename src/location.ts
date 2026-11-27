import { PermissionsAndroid, Platform } from 'react-native';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

async function requestAndroidLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
    title: 'Location access required',
    message: 'Smart Fan Mobility needs your current position to start live navigation and match pickups.',
    buttonPositive: 'Allow location',
    buttonNegative: 'Not now',
  });

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function requestCurrentCoordinates(): Promise<Coordinate | null> {
  const permissionGranted = await requestAndroidLocationPermission();
  if (!permissionGranted) {
    return null;
  }

  const geolocation = (globalThis as typeof globalThis & {
    navigator?: { geolocation?: { getCurrentPosition: Function } };
  }).navigator?.geolocation;

  if (!geolocation?.getCurrentPosition) {
    return null;
  }

  return new Promise((resolve) => {
    geolocation.getCurrentPosition(
      (position: { coords?: { latitude?: number; longitude?: number } }) => {
        const latitude = position.coords?.latitude;
        const longitude = position.coords?.longitude;
        if (typeof latitude === 'number' && typeof longitude === 'number') {
          resolve({ latitude, longitude });
          return;
        }
        resolve(null);
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 },
    );
  });
}
