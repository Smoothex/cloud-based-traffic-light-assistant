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
5. Either build the `android` folder locally with  `npx expo prebuild` or skip this step because it happens automatically in the pipeline
6. Add the environmental variables from your `.env` file in Secrets of your Expo project on the Expo dev page in order to build the app correctly
7. Start a building pipeline with `eas build -p android --profile development`
8. After the pipeline succeeds you can download the <em>.apk</em> on your file via the link from your terminal or you can find it in Builds on the Expo dev page
9. After installing the app on your physical device you have to start a server with `npx expo start`

## How to run the app using Expo Go

1. Install Expo Go on your physical device from [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent&pcampaignid=web_share) for Android or [App Store](https://apps.apple.com/us/app/expo-go/id982107779) for iOS.

2. Install dependencies by running `npm install` in the terminal.

3. Set the `EXPO_PUBLIC_GOOGLE_API_KEY` environment in a .env file. This project uses Google APIs, so you need to configure an API Key in your [Google Cloud](https://console.cloud.google.com) account.

4. Run `npm start` to start the app.

5. On your device, open Expo Go and scan the QR code to connect to the development server. When the project starts loading, you see this in the terminal, see the gif below.
   
   ![demo-ezgif com-video-to-gif-converter](https://github.com/Smoothex/cloud-based-traffic-light-assistant/assets/79105432/3b2bed45-0a5d-4f7a-a3a0-624c75e14d8e)


## Build
Using GitHub Actions we have created a workflow for building an APK app for Android. It uses [Expo Application Services (EAS)](https://expo.dev/eas) and specifically [EAS Build](https://docs.expo.dev/build/introduction/), which builds the app binary for the project.

The build command starts the build process on the EAS Build servers by default. Since [EAS is a paid service](https://expo.dev/pricing#pay-as-you-grow), the free tier is restricted to 30 builds per month. In order to avoid this limited number of builds, the `eas build` command in the pipeline uses the `--local` flag. This allows for running the same build process locally on the machine instead of in the Expo's managed environment. Although [building locally has some limitations](https://docs.expo.dev/build-reference/local-builds/#limitations), the local builds do not count to the said free 30 builds per month.

Unfortunately, Expo secrets can only be accessed by EAS cloud builds, and the local builds inside the GitHub runners can't access the Google Geolocation API key we need for the maps. Therefore, we set the `EXPO_PUBLIC_GOOGLE_API_KEY` variable as a repository secret and include it in the workflow.


## Express server

The express server starts with the `npm start` command to run the application in Metro Builder.
