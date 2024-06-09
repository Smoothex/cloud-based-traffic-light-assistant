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
