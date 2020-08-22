import { useState, useEffect } from 'react';
import { ChannelData } from '../types';
import constants from '../constants';


const useAudioAnalyzer = (audio: HTMLAudioElement) => {
    const [context] = useState(new AudioContext());
    const [splitter] = useState(context.createChannelSplitter());
    const [leftAnalyser] = useState(context.createAnalyser());
    const [rightAnalyser] = useState(context.createAnalyser());
    const [leftData, setLeftData] = useState(new Uint8Array());
    const [rightData, setRightData] = useState(new Uint8Array());
    
    useEffect(() => {
        // connect the audio element to the analyser node and the analyser node
        // to the main Web Audio context
        // connect the channel splitter to the audio that's playing to divide it into two tracks
        const source = context.createMediaElementSource(audio);
        source.connect(splitter);
        splitter.connect(context.destination);
        initializeAnalysers();
    }, []);

    const initializeAnalysers = () => {
        // setup that I don't fully understand, but is necessary
        leftAnalyser.fftSize = constants.audio.FFT_SIZE;
        rightAnalyser.fftSize = constants.audio.FFT_SIZE;
        
        // pretty sure that the second param for this specifies which channel to connect the analyser to
        splitter.connect(leftAnalyser, 0, 0);
        splitter.connect(rightAnalyser, 1, 0);
    
        // set up the data arrays that will be used to read the frequencies
        const bufferLength = leftAnalyser.frequencyBinCount;
        setLeftData(new Uint8Array(bufferLength));
        setRightData(new Uint8Array(bufferLength));
    }

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
    boolean,
    () => void,
    (src: string) => void
]

export const useAudio = (refreshInterval: number, updateChannelData: (data: ChannelData) => void): AudioReturn => {
    const [audio] = useState(new Audio());
    const [playing, setPlaying] = useState(false);
    const [getCurrentAudioData] = useAudioAnalyzer(audio);
    const [refresher, setRefresher] = useState<NodeJS.Timeout | undefined>();

    useEffect(() => {
        // setAudio({
        //     ...audio,
        //     loop: false,
        //     autoplay: false,
        //     crossOrigin: 'anonymous'
        // })

        setUpEventListeners();
        return () => {
            tearDownEventListeners();
        }
    }, []);

    useEffect(() => {
        // TODO: this can probably be done in a cleaner way.
        // this is what causes the audio data to update.

        if (playing) {
            audio.play();
            const interval = setInterval(() => {
                updateChannels();
            }, refreshInterval);
            setRefresher(interval);
        } else {
            audio.pause();
            if (refresher) {
                clearInterval(refresher);
                setRefresher(undefined);
            }
        }
        playing ? audio.play() : audio.pause(); // TODO: weird
    }, [playing]);

    const setUpEventListeners = () => {
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('ended', () => setPlaying(false));
    }
    
    const tearDownEventListeners = () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('ended', () => setPlaying(false));
    }

    const toggle = () => {
        setPlaying(!playing);
    }

    const loadSrc = (src: string) => {
        audio.src = src; // TODO: jank to be modifying audio like this
        audio.load();
    }

    const handleCanPlay = () => {
        // TODO: idk if I even need this
        
    }

    const updateChannels = () => {
        if (playing) {
            const newData = getCurrentAudioData();
            // this sends the updated audio data back to the parent component.
            updateChannelData(newData);
        }
    }

    return [playing, toggle, loadSrc];
}