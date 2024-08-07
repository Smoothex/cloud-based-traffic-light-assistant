import {Image, SafeAreaView, StyleSheet, Text, View} from "react-native";
import {useEffect, useRef, useState} from "react";
import MapView, {LatLng, Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef
} from "react-native-google-places-autocomplete";
import MapViewDirections from "react-native-maps-directions";
import Constants from "expo-constants";
import VoiceInput from "@/components/VoiceInput";
import NavigationButton from "@/components/NavigationButton";
import {LocaleCodes} from "@/constants/LocaleCodes";
import {Thresholds} from "@/constants/Thresholds";
import {SpeakingThresholds, SpeechOptionsObject} from "@/constants/SpeechConstants";
import {convertHtmlTextToPlainText, convertMinutesToHours} from "@/utilClasses/converterUtil";
import {getLocalTimestamp, getLightBackgroundColor, getWarningMessageByTrafficLightPhase} from "@/utilClasses/getMethodsUtil";
import {calculateInitialRegion} from "@/utilClasses/calculationsUtil";
import TraceRouteButton from "@/components/TraceRouteButton";
import MyLocationButton from "@/components/MyLocationButton";
import StepList from "@/components/StepList";
import * as Location from "expo-location";
import * as geolib from 'geolib';
import * as Speech from 'expo-speech';
import {Audio} from 'expo-av';
import {MapsResponse} from "@/interfaces/mapsResponse";
import {SpatsResponse, TrafficLightData} from "@/interfaces/spatsResponse";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const TU_USER_AUTH_TOKEN = process.env.EXPO_PUBLIC_TU_USER_AUTH_TOKEN;
const TRAFFIC_LIGHT_TOOL_URL = 'https://werkzeug.dcaiti.tu-berlin.de/0432l770/trafficlights';
const SPAT_URL = TRAFFIC_LIGHT_TOOL_URL + '/spat?intersection=';
const INTERSECTION_REGION_ID_STRING = '643@49030';
const LOCAL_IP_ADDRESS = '192.168.0.104'; // Read the documentation to find how to get your local IP address
const PROXY_SERVER_PORT = '3000';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isNavigationActive, setIsNavigationActive] = useState(false);
  const [locationWatcher, setLocationWatcher] = useState<Location.LocationSubscription>(null);
  const [steps, setSteps] = useState<StepsArray>([]);
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [offRouteTimer, setOffRouteTimer] = useState(null);
  const [userHeading, setUserHeading] = useState(0);
  const [headingWatcher, setHeadingWatcher] = useState(null);
  const mapRef = useRef<MapView>(null);
  const autoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
  const [trafficLightLocation, setTrafficLightLocation] = useState<MapsResponse | null>(null);
  const [trafficLightStatus, setTrafficLightStatus] = useState<SpatsResponse | null>(null);
  const [trafficLightData, setTrafficLightData] = useState<TrafficLightData[]>([]);
  const intervalRef = useRef(null);
  let lastDistanceWhenInstructionsRead = 0;

  useEffect(() => {
    (async () => {
      if (GOOGLE_API_KEY.length === 0) {
        console.warn('Your GOOGLE_API_KEY is empty! Please check your .env file!');
      }

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

    fetchMapData(INTERSECTION_REGION_ID_STRING).then(() => {
      getTrafficLightStatusUpdate(Thresholds.TRAFFIC_LIGHT_FETCH_DATA_INTERVAL);
      //fetchSpatData(url, INTERSECTION_ID_REGION_ID_STRING); // for testing purpose
    })

    return() => {
      clearInterval(intervalRef.current);
    }
  }, []);

  async function getTrafficLightStatusUpdate(interval: number) {
    intervalRef.current = setInterval(() => {
      fetchSpatData(INTERSECTION_REGION_ID_STRING).then((fetchedTrafficLightData: any) => {
        //console.log("traffic light data", fetchedTrafficLightData)  //TODO do we need it?
      })
    }, interval)
  }

  /**
   * Moves the camera to the specified location on the map.
   *
   * @param {LatLng} position The position to move the camera to.
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

  const fetchSpatData = async (intersectionId: string): Promise<SpatsResponse> => {
    try {
      if (TU_USER_AUTH_TOKEN.length === 0) {
        console.warn('Your TU_USER_AUTH_TOKEN is empty! Please check your .env file!');
      }

      const response = await fetch(`${SPAT_URL}${intersectionId}`,
        {
          headers: {
            'Authorization': `Basic ${TU_USER_AUTH_TOKEN}`,
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': 'localhost:8081'
          },
        }
      );

      const json = await response.json();
      //console.log('Fetch Spat Data:', getLocalTimestamp()); // for testing purpose

      setTrafficLightStatus(json);
      await updateTrafficLightData(intersectionId, json, null);
      return json;
    } catch (error) {
      console.error('Error fetching traffic status data:', error);
      return null;
    }
  };

  const fetchMapData = async (intersectionId: string) => {
    try {
      //localhost : 192.168.1.101 ~ through terminal `ifconfig en0` wifi needs to be on
      if (LOCAL_IP_ADDRESS.includes('X') || LOCAL_IP_ADDRESS.length === 0) {
        console.warn('Your LOCAL_IP_ADDRESS variable is incorrect or empty! See documentation for how to get it!');
      }

      const response : any = await fetch(`http://${LOCAL_IP_ADDRESS}:${PROXY_SERVER_PORT}/trafficlights/maps/${intersectionId}`, {
        //No more needed as already handled in server side
      });

      const json = await response.json();
      //console.log('Fetch Map Data:', getLocalTimestamp()); // for testing purpose

      setTrafficLightLocation(json);
      await updateTrafficLightData(intersectionId, null, json);
    } catch (error) {
      console.error('Error fetching traffic location data:', error);
    }
  };

  const updateTrafficLightData = async (intersectionId: string, spatData: SpatsResponse | null, mapData: any | null) => {
    const idArray = intersectionId.split(',').map(id => id.trim());

    setTrafficLightData(prevData => {
      let updatedData = [...prevData];

      idArray.forEach(intersectionId => {
        const existingIndex = updatedData.findIndex(item => item.intersectionId === intersectionId);

        if (existingIndex !== -1) {
          // Update existing object
          updatedData[existingIndex] = {
            ...updatedData[existingIndex],
            spatData: spatData || updatedData[existingIndex].spatData,
            mapData: mapData || updatedData[existingIndex].mapData
          };
        } else {
          // Add new object
          updatedData.push({ intersectionId, spatData, mapData });
        }
      });

      return updatedData;
    });
  }

  /**
   * Updates the origin or destination location based on the given details and type.
   *
   * @param {GooglePlaceDetail | null} details - The details of the place selected.
   * @param {"origin" | "destination"} type - The type of location being updated.
   */
  const onPressAddress = (details: GooglePlaceDetail | null, type: 'origin' | 'destination') => {
    if (isNavigationActive) {
      stopNavigation();
    }

    if (details) {
      const position = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng
      };

      type === 'origin' ? setOrigin(position) : setDestination(position);

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

      const routeSteps: StepsArray = args.legs[0]?.steps.map((step: { distance: { text: string; }; end_location: { lat: number, lng: number }; html_instructions: string; }) => ({
        distance: step.distance.text,
        end_location: step.end_location,
        instruction: convertHtmlTextToPlainText(step.html_instructions)
      }));

      setSteps(routeSteps || []);
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

    Speech.speak('Navigation wurde gestartet.', SpeechOptionsObject);
    moveToLocation(origin)
    setIsNavigationActive(true);

    try {
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: Thresholds.UPDATE_LOCATION_INTERVAL, // Update location after each predefined number of meters
          timeInterval: Thresholds.CHECK_INTERVAL
        },
        async ({ coords }) => {
          const userLocation: UserLocationSpeed = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            speed: coords.speed || 0,
          };
          moveToLocation(userLocation);

          if (!!steps.length) {
            const nextStep: SingleStep = steps[0]; // Get the next step to display
            //console.log("Next step:", nextStep); // for testing purposes

            const stepLocation: LatLng = {
              latitude: nextStep.end_location.lat,
              longitude: nextStep.end_location.lng
            };
            const distanceToNextStep: number = geolib.getDistance(userLocation, stepLocation);

            if (lastDistanceWhenInstructionsRead === 0 || (lastDistanceWhenInstructionsRead !== distanceToNextStep 
              && lastDistanceWhenInstructionsRead - distanceToNextStep >= Thresholds.MIN_DISTANCE_FOR_REPEATING_INSTRUCTIONS)) {
              // Play the instruction only the first time or when a pre-defined distance is covered
              Speech.speak(nextStep.distance + ' ' + nextStep.instruction, SpeechOptionsObject);
              lastDistanceWhenInstructionsRead = distanceToNextStep;
            }

            // Check if within a threshold distance
            if (distanceToNextStep <= Thresholds.MIN_DISTANCE_TO_NEXT_STEP) {
              setSteps((prevSteps) => prevSteps.slice(1)); // Remove the reached step
              lastDistanceWhenInstructionsRead = 0; // Reset the counter for when to repeat the instruction
            }

            checkOffRoute(userLocation, stepLocation, distanceToNextStep);
            checkNearTrafficLight(userLocation);
          }

          const headingWatcher = await Location.watchHeadingAsync((headingData) => {
            setUserHeading(headingData.trueHeading);
          });
          setHeadingWatcher(headingWatcher);

        }).then((locationWatcher) => {
          setLocationWatcher(locationWatcher);
        }).catch((err) => {
          console.log(err);
        });
      console.log('Tracking started');
    } catch (error) {
      console.error('Error on starting navigation:', error);
    }
  };

  async function stopNavigation() {
    // Reset all states and stop processes
    setIsNavigationActive(false);
    locationWatcher?.remove();
    lastDistanceWhenInstructionsRead = 0;
    stopBeepSound();

    if (offRouteTimer) {
      clearTimeout(offRouteTimer);
      setOffRouteTimer(null);
    }

    if (headingWatcher) {
      headingWatcher.remove();
    }

    Speech.stop();
    Speech.speak('Navigation wurde beendet.', SpeechOptionsObject);
    console.log('Tracking stopped');
  }

  function updateTextInputOnEndOfSpeaking(result: string) {
    autoCompleteRef.current.clear();

    if (!result.split(' ').includes('Berlin')) {
      result = result.concat(', Berlin');
    }

    autoCompleteRef.current.setAddressTextAndQuery(result);
  }

  function playOnError(err: Error) {
    Speech.speak('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', SpeechOptionsObject);
    console.log('Error on speaking input:', err);
  }

  function checkOffRoute(userLocation: UserLocationSpeed, stepLocation: LatLng, distanceToNextStep: number) {
    const bearingToNextStep: number = geolib.getRhumbLineBearing(userLocation, stepLocation);
    const userBearing: number = userHeading;

    const bearingDifference: number = Math.abs(bearingToNextStep - userBearing);

    if (distanceToNextStep > Thresholds.MIN_OFF_ROUTE_DISTANCE) {
      setIsOffRoute(true);

      if (bearingDifference > Thresholds.OPPOSITE_DIRECTION_THRESHOLD) {
        // User is going in the opposite direction
        playBeepSound(1);
      } else {
        // User is off-route but not in the opposite direction
        playBeepSound(0.5);
      }

      // If user is stationary and off-route
      if (userLocation.speed <= Thresholds.STATIONARY_THRESHOLD) {
        stopBeepSound();
        if (!offRouteTimer) {
          setOffRouteTimer(setTimeout(speakOffRouteMessage, SpeakingThresholds.DURATION_OF_WAITING_TIMER_FOR_OFF_ROUTE_MESSAGE)); // Wait some seconds before speaking
        }
      } else {
        if (offRouteTimer) {
          clearTimeout(offRouteTimer);
          setOffRouteTimer(null);
        }
      }
    } else {
      setIsOffRoute(false);
      stopBeepSound();
      if (offRouteTimer) {
        clearTimeout(offRouteTimer);
        setOffRouteTimer(null);
      }
    }
  }

  function checkNearTrafficLight(userLocation: UserLocationSpeed) {
    const distanceToTrafficLight: number = geolib.getDistance(userLocation, trafficLightLocation.centerPoint.positionWGS84);

    if (distanceToTrafficLight <= Thresholds.THRESHOLD_DISTANCE_TO_TRAFFIC_LIGHT) {
      let trafficLightPhase = trafficLightStatus.intersectionStates[0].movementStates[0].movementEvents[0].phaseState;
      playBeepSound(3); // play sound to get user's attention
      Speech.speak(getWarningMessageByTrafficLightPhase(trafficLightPhase, distanceToTrafficLight), SpeechOptionsObject); // warn the user about the traffic light
    }
  }

  async function playBeepSound(intensity: number) {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/beep.mp3')
    );
    setSound(sound);

    // Play the sound at different rates based on intensity
    await sound.setRateAsync(0.5 + (intensity * 0.5), true);
    await sound.playAsync();
  }

  function stopBeepSound() {
    if (sound) {
      sound.unloadAsync();
    }
  }

  function speakOffRouteMessage() {
    Speech.speak('Sie sind möglicherweise vom Weg abgekommen.', SpeechOptionsObject);
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

        {trafficLightData.map((data, index) => (
            data.mapData?.laneSetConverted?.map((data, internalIndex) => (
                <Marker key={internalIndex} coordinate={{latitude:data.nodeListConverted[0].positionWGS84.lat,
                  longitude: data.nodeListConverted[0].positionWGS84.lng}} >
                  <Image
                      style={[styles.markerImage, getLightBackgroundColor(trafficLightData[index].spatData, 
                        data.connectsToConverted[0].signalGroup)]}
                      source={require('../assets/images/trafficlight.png')}
                  />
                </Marker>
            ))
        ))}

        {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            mode='WALKING'
            language={LocaleCodes.germanLanguageCode}
            strokeColor='#6644ff'
            strokeWidth={4}
            onReady={traceRouteOnReady}
          />
        )}
      </MapView>

      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          ref={autoCompleteRef}
          placeholder='Richtung eingeben'
          fetchDetails={true}
          enableHighAccuracyLocation={true}
          debounce={300}
          keepResultsAfterBlur={false}
          minLength={3}
          onPress={(data, details = null) => onPressAddress(details, 'destination')}
          onFail={err => playOnError(err)}
          listEmptyComponent={(
            <View style={{ flex: 1 }}>
              <Text>No results were found</Text>
            </View>
          )}
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
            blurOnSubmit: true,
            maxLength: 80,
          }}
        />
        <TraceRouteButton traceRoute={traceRoute} />
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

      {isNavigationActive && !!steps.length &&
        (<StepList steps={steps} />)
      }

      <MyLocationButton moveToLocation={moveToLocation} location={location} />

      {!isNavigationActive &&
        (<VoiceInput setResults={updateTextInputOnEndOfSpeaking} />) // show voice input button when navigation is off
      }
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
    position: 'absolute',
    width: '90%',
    backgroundColor: 'white',
    shadowColor: 'black',
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
  markerImage: {
    width: 35,
    height: 35,
  },
});
