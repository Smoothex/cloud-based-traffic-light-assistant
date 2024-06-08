import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    android: {
        config: {
            googleMaps: {
                apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
            }
        },
        package: 'com.dcaitiProject.cloudBasedTrafficLightAssistant',
    },
    slug: 'cloud-based-traffic-light-assistant',
    name: 'cloud-based-traffic-light-assistant',
});