import { LocaleCodes } from "./LocaleCodes";
import * as Speech from "expo-speech";

export const SpeechOptionsObject: Speech.SpeechOptions = { rate: 0.85, language: LocaleCodes.germanLanguageCode };

export const SpeakingThresholds = {
    DURATION_OF_WAITING_TIMER_FOR_OFF_ROUTE_MESSAGE: 10000 // milliseconds 
};