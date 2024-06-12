[![Android App APK Build](https://github.com/Smoothex/cloud-based-traffic-light-assistant/actions/workflows/eas-android-apk-build.yaml/badge.svg?branch=master)](https://github.com/Smoothex/cloud-based-traffic-light-assistant/actions/workflows/eas-android-apk-build.yaml)

# Welcome to our Cloud-based traffic light assistant app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

# Prerequisites
- npm version: ~10.8.1
- Node.js version: ~21.7.3

# Changes in libraries
1. react-native-google-places-autocomplete
   - Go to node_modules and find the library
   - In GooglePlacesAutocomplete.js go to line 866 and add the following code:
   ```
   if (stateText?.length > 0) {
      _handleChangeText(stateText);
   }
   ```
   - This allows for results to be queried when text is input by voice

## How to build the app using EAS CLI

1. In the terminal install eas-cli using `npm install -g eas-cli`
2. Create an account for [Expo Dev](expo.dev)
3. Log in with your credentials using `eas login`
4. Configure your project using `eas build:configure`, which creates an 
`eas.json` file with configs
5. Either build the `android` folder locally with  `npx expo prebuild` or skip to 
next step where it happens automatically
6. Start a building pipeline with `eas build -p android --profile development`.
7. After the pipeline succeeds you can download the <em>.apk</em> on your file 
via the link from your terminal or you can find it in Builds on the Expo dev page
8. After installing the app on your device you have to start a server 
with `npx expo start`

## How to run the app using Expo Go

1. Install dependencies
   ```
   npm install
   ```

2. Create a .env folder where to place the some non-public data like the Google API key in our case.

3. Start the app
   ```
    npx expo start
   ```

## Build
Using GitHub Actions we have created a workflow for building an APK app for Android. It uses [Expo Application Services (EAS)](https://expo.dev/eas) and specifically [EAS Build](https://docs.expo.dev/build/introduction/), which builds the app binary for the project.

The build command starts the build process on the EAS Build servers by default. Since [EAS is a paid service](https://expo.dev/pricing#pay-as-you-grow), the free tier is restricted to 30 builds per month. In order to avoid this limited number of builds, the `eas build` command in the pipeline uses the `--local` flag. This allows for running the same build process locally on the machine instead of in the Expo's managed environment. Although [building locally has some limitations](https://docs.expo.dev/build-reference/local-builds/#limitations), the local builds do not count to the said free 30 builds per month.

Unfortunately, Expo secrets can only be accessed by EAS cloud builds, and the local builds inside the GitHub runners can't access the Google Geolocation API key we need for the maps. Therefore, we set the `EXPO_PUBLIC_GOOGLE_API_KEY` variable as a repository secret and include it in the workflow.
