import { useState, useEffect } from 'react';

import constants from '../constants';

/**
 * State hook for an AnalyserNode.
 * @param context the AudioContext the node will be attached to.
 */
const useAudioAnalyser = (context: AudioContext): [AnalyserNode, () => Uint8Array] => {
    const [analyser] = useState(context.createAnalyser());
    const [dataBuffer, setDataBuffer] = useState(new Uint8Array());

    /** Effect hook for initialization stuff */
    useEffect(() => {
        analyser.fftSize = constants.audio.FFT_SIZE;

        const bufferLength = analyser.frequencyBinCount; // this is just fftSize / 2
        setDataBuffer(new Uint8Array(bufferLength));
    }, [])

    const getCurrentData = (): Uint8Array => {
        // this checks what is currently playing and places the frequency spectrum into the data buffer.
        analyser.getByteFrequencyData(dataBuffer);
        return dataBuffer;
    }

    return [analyser, getCurrentData];
}

/**
 * State Hook for analysing split channels of data.
 * @param audio the HTMLAudioElement which will be analysed.
 */
export const useTwoChannelAnalyser = (audio: HTMLAudioElement) => {
    const [context] = useState(new AudioContext());
    const [leftAnalyser, getLeftData] = useAudioAnalyser(context);
    const [rightAnalyser, getRightData] = useAudioAnalyser(context);
    
    /** Effect hook for initialization stuff */
    useEffect(() => {
        // create the splitter and connect it to the audio element
        const splitter = context.createChannelSplitter();
        const source = context.createMediaElementSource(audio);
        source.connect(splitter);
        splitter.connect(context.destination);

        // connect the analysers to the appropriate channels
        splitter.connect(leftAnalyser, constants.audio.outputChannels.LEFT);
        splitter.connect(rightAnalyser, constants.audio.outputChannels.RIGHT);
    }, []);

    const getCurrentAudioData = () => {
        const left = getLeftData();
        const right = getRightData();
        return {
            left,
            right
        };
    }

    return [getCurrentAudioData];
}

type AudioHookReturn = [
    HTMLAudioElement,
    boolean,
    () => void,
    (file: File) => void
]

/**
 * State hook for playing audio.
 * @param src (optional) the string representing the audio source.
 */
export const useAudio = (src?: string): AudioHookReturn => {
    const [audio] = useState(new Audio(src));
    const [playing, setPlaying] = useState(false);

    /** Effect hook for initialization stuff */
    useEffect(() => {
        setUpEventListeners();
        return () => {
            tearDownEventListeners();
        }
    }, []);

    /** Effect hook for toggling the playing/pausing of the audio */
    useEffect(() => {
        playing ? audio.play() : audio.pause();
    }, [playing]);

    const setUpEventListeners = () => {
        audio.addEventListener('ended', () => setPlaying(false));
    }
    
    const tearDownEventListeners = () => {
        audio.removeEventListener('ended', () => setPlaying(false));
    }

    const toggle = () => {
        setPlaying(!playing);
    }

    const loadFromFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
            if (!readerEvent.target || typeof(readerEvent.target.result) !== 'string') {
                console.log('UNRECOGNIZED READEREVENT: ', readerEvent.target);
                return;
            }
            const audioSrc = readerEvent.target.result;
            audio.src = audioSrc;
            audio.load();
        }
        reader.readAsDataURL(file);
    }

    return [audio, playing, toggle, loadFromFile];
}