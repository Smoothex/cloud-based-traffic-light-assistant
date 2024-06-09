import { useEffect, useState } from 'react';
import {
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';

import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@wdragon/react-native-voice';

interface modalProps {
  setResults: (result: string) => void,
  styles: StyleProp<ViewStyle>;
}

const GERMAN_LOCALE='de-DE';

export default function VoiceInput({ setResults, styles } : modalProps) {
  const [error, setError] = useState('');
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
    console.log('onSpeechError: ', e);
    setError(JSON.stringify(e.error));
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    console.log('onSpeechResults: ', e);
    setResults(e.value[0]);
  };

  const _startRecognizing = async () => {
    _clearState();
    try {
      await Voice.start(GERMAN_LOCALE);
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

  const _clearState = () => {
    setError('');
  };

  return (
    <TouchableOpacity style={styles} onPress={isSpeaking ? _stopRecognizing : _startRecognizing}>
      <Image style={{width: 75, height: 75}} source={isSpeaking ? require('../assets/images/stopRecordButton.png') : require('../assets/images/startRecordButton.png')}/>
    </TouchableOpacity>
  );
}
