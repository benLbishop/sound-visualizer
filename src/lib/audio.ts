import { useState, useEffect } from 'react';

import constants from '../constants';

export const useAudioAnalyzer = (audio: HTMLAudioElement) => {
    const [context] = useState(new AudioContext());
    const [splitter] = useState(context.createChannelSplitter());
    const [leftAnalyser] = useState(context.createAnalyser());
    const [rightAnalyser] = useState(context.createAnalyser());
    const [leftData, setLeftData] = useState(new Uint8Array());
    const [rightData, setRightData] = useState(new Uint8Array());
    
    /** Effect hook for initialization stuff */
    useEffect(() => {
        // connect the channel splitter to the audio that's playing
        const source = context.createMediaElementSource(audio);
        source.connect(splitter);
        splitter.connect(context.destination);

        leftAnalyser.fftSize = constants.audio.FFT_SIZE;
        rightAnalyser.fftSize = constants.audio.FFT_SIZE;
        
        // pretty sure that the second param for this specifies which channel to connect the analyser to
        splitter.connect(leftAnalyser, 0, 0);
        splitter.connect(rightAnalyser, 1, 0);
    
        // set up the data arrays that will be used to read the frequencies
        const bufferLength = leftAnalyser.frequencyBinCount;
        setLeftData(new Uint8Array(bufferLength));
        setRightData(new Uint8Array(bufferLength));
    }, []);

    const getCurrentAudioData = () => {
        // this checks what is currently playing and places the frequency spectrum
        // into the arrays leftData and rightData.
        leftAnalyser.getByteFrequencyData(leftData);
        rightAnalyser.getByteFrequencyData(rightData);
        return {
            left: leftData,
            right: rightData
        };
    }

    return [getCurrentAudioData]
}

type AudioReturn = [
    HTMLAudioElement,
    boolean,
    () => void,
    (file: File) => void
]

/**
 * State hook for playing audio.
 * @param src (optional) the string representing the audio source.
 */
export const useAudio = (src?: string): AudioReturn => {
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