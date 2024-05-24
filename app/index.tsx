import { Text, View, StyleSheet, Dimensions, SafeAreaView } from "react-native";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import MapView, { LatLng, Marker, PROVIDER_GOOGLE, Point, Region } from "react-native-maps";
import { GooglePlaceDetail, GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const REGION_BERLIN = {
  latitude: 52.520008,
  longitude: 13.404954,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA
}

export default function App() {
  const [location, setLocation] = useState({} as Location.LocationObject);
  const [destination, setDestination] = useState({latitude: REGION_BERLIN.latitude, longitude: REGION_BERLIN.longitude} as LatLng);
  const [mapMoved, setMapMoved] = useState(false);
  const mapRef = useRef<MapView>({} as MapView);

   const onPressAddress = (details:GooglePlaceDetail) => {
    setDestination({
      latitude: details?.geometry?.location.lat,
      longitude: details?.geometry?.location.lng,
    });
    if (details) {
      moveToLocation(details?.geometry?.location.lat, details?.geometry?.location.lng);
    }
  };

  async function moveToLocation(latitude:number, longitude:number) {
    mapRef.current.animateToRegion(
      {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      2000,
    );
  };

  useEffect(() => {
    (async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const onRegionChange = (region: Region) => {
    setMapMoved(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search your destination"
          fetchDetails={true}
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            onPressAddress(details);
          }}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
            language: 'en',
          }}
        />
      </View>
      <MapView
        style={styles.map}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={REGION_BERLIN}
        showsMyLocationButton={mapMoved}
        showsUserLocation
        onRegionChangeComplete={onRegionChange}>
        {(destination.latitude && destination.longitude) && <Marker coordinate={destination} />}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  searchContainer: {
    zIndex: 1,
    flex: 0.4,
    marginRight: 60,
  },
});
