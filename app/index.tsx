import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlaceDetail, GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import MapViewDirections from "react-native-maps-directions";
import Constants from "expo-constants";
import MyLocation from 'react-native-vector-icons/MaterialIcons';
import VoiceInput from "@/components/VoiceInput";
import NavigationButton from "@/components/NavigationButton";
import { LocaleCodes } from "@/constants/LocaleCodes";
import { convertMinutesToHours } from "@/utilClasses/timeConverter";
import { calculateInitialRegion } from "@/utilClasses/calculationsUtil";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isNavigationActive, setIsNavigationActive] = useState(false);
  const [locationWatcher, setLocationWatcher] = useState<Location.LocationSubscription>(null);
  const mapRef = useRef<MapView>(null);
  const autoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setOrigin({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    })();
  }, []);

  /**
   * Moves the camera to the specified location on the map.
   *
   * @param {LatLng} position - The position to move the camera to.
   * @return {Promise<void>} A promise that resolves when the camera animation is complete.
   */
  const moveToLocation = async (position: LatLng): Promise<void> => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      const newRegion = {
        ...position,
        latitudeDelta: 0.0018, // adjust zoom level here (smaller value = more zoom)
        longitudeDelta: 0.0018,
      };
      mapRef.current?.animateToRegion(newRegion, 2000);
    }
  };

  /**
   * Updates the origin or destination location based on the given details and type.
   *
   * @param {GooglePlaceDetail | null} details - The details of the place selected.
   * @param {"origin" | "destination"} type - The type of location being updated.
   */
  const onPressAddress = (details: GooglePlaceDetail | null, type: "origin" | "destination") => {
    if (details) {
      const position = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng
      };

      if (type === "origin") {
        setOrigin(position);
      } else {
        setDestination(position);
      }

      moveToLocation(position);
    }
  };

  const traceRoute = () => {
    if (origin && destination) {
      mapRef.current?.fitToCoordinates([origin, destination], { edgePadding: { top: 70, right: 70, bottom: 70, left: 70 } });
    }
  };

  const traceRouteOnReady = (args: any) => {
    if (args) {
      setDistance(args.distance);
      setDuration(Math.round(args.duration));
    }
  };

  /**
   * Starts navigation from the origin to the destination.
   * Subscribes to current user location and follows it when the user moves.
   */
  async function startNavigation() {
    if (!origin || !destination) {
      return;
    }
    moveToLocation(origin)
    setIsNavigationActive(true);
    try {
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 3, // Update location every 3 meters
        },
        ({ coords }) => {
          const userLocation = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
          moveToLocation(userLocation);
        }).then((locationWatcher) => {
          setLocationWatcher(locationWatcher);
        }).catch((err) => {
          console.log(err);
        });
      console.log('Tracking started');
    } catch (error) {
      console.error("Error starting navigation:", error);
    }
  };

  async function stopNavigation() {
    setIsNavigationActive(false);
    console.log('Tracking stopped');
    locationWatcher?.remove();
  }

  function updateTextInputOnEndOfSpeaking(result: string) {
    autoCompleteRef.current.blur();
    autoCompleteRef.current.focus();
    autoCompleteRef.current.setAddressText(result);
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={calculateInitialRegion()}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {origin && <Marker coordinate={origin} />}
        {destination && <Marker coordinate={destination} />}
        {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            mode="WALKING"
            strokeColor="#6644ff"
            strokeWidth={4}
            onReady={traceRouteOnReady}
          />
        )}
      </MapView>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          ref={autoCompleteRef}
          placeholder="Search for your destination"
          fetchDetails={true}
          enableHighAccuracyLocation
          keepResultsAfterBlur={false}
          minLength={3}
          onPress={(data, details = null) => onPressAddress(details, "destination")}
          query={{
            key: GOOGLE_API_KEY,
            language: LocaleCodes.germanLanguageCode,
            components: LocaleCodes.germanCountrySearchRestrictionCode,
          }}
          styles={{
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
            predefinedPlacesDescription: styles.predefinedPlacesDescription,
          }}
          textInputProps={{
            onFocus: () => {
              console.log('text input is focused');
            },
            maxLength: 60,
          }}
        />
        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Trace Route</Text>
        </TouchableOpacity>
        {distance && duration ? (
          <View>
            <Text>Distance: {distance.toFixed(2)} km</Text>
            <Text>Duration: {convertMinutesToHours(duration)}</Text>
          </View>
        ) : null}
        {origin && destination ? (
          <NavigationButton startNavigation={startNavigation} stopNavigation={stopNavigation} origin={origin}
            destination={destination} isNavigationActive={isNavigationActive} />
        ) : null}
      </View>
      <TouchableOpacity style={styles.locationButton} onPress={() => {
        if (location) {
          moveToLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      }}>
        <MyLocation name="my-location" size={50} color="#fff" />
      </TouchableOpacity>
      <VoiceInput setResults={updateTextInputOnEndOfSpeaking} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: "absolute",
    width: "90%",
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    borderRadius: 8,
    top: Constants.statusBarHeight - 10,
    alignSelf: 'center',
    zIndex: 1,
  },
  textInputContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  textInput: {
    borderRadius: 5,
    padding: 5,
    height: 38,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  predefinedPlacesDescription: {
    color: '#1faadb',
  },
  button: {
    backgroundColor: "#bbb",
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 4,
  },
  buttonText: {
    textAlign: "center",
  },
  locationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#900',
    padding: 10,
    borderRadius: 50,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  locationButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
