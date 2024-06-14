import { useEffect, useState } from 'react';
import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@wdragon/react-native-voice';
import { LocaleCodes } from "@/constants/LocaleCodes";

type VoiceInputProps = {
  setResults: (result: string) => void;
}

export default function VoiceInput({ setResults } : VoiceInputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = (e: any) => {
    console.log('onSpeechStart: ', e);
    setIsSpeaking(true);
  };

  const onSpeechEnd = (e: any) => {
    console.log('onSpeechEnd: ', e);
    setIsSpeaking(false);
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    console.log('An error occurred: ', JSON.stringify(e.error));
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    console.log('onSpeechResults: ', e);
    setResults(e.value[0]);
  };

  const _startRecognizing = async () => {
    try {
      await Voice.start(LocaleCodes.germanLocaleVoiceInputCode);
      console.log('called start');
    } catch (e) {
      console.error(e);
    }
  };

  const _stopRecognizing = async () => {
    try {
      await Voice.stop();
      setIsSpeaking(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <TouchableOpacity style={styles.speakingButton} onPress={isSpeaking ? _stopRecognizing : _startRecognizing}>
      <Image style={styles.buttonImage} source={isSpeaking ? require('../assets/images/stopRecordButton.png') : require('../assets/images/startRecordButton.png')}/>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  speakingButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
  },
  buttonImage: {
    width: 75, 
    height: 75,
  },
});
