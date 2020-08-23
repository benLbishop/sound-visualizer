import React, { useState, useEffect } from 'react';

import { ChannelData } from '../../types';
import { useAudio, useTwoChannelAnalyser } from '../../lib/audio';

import './AudioContainer.css';

interface Props {
  refreshInterval: number;
  updateChannelData(data: ChannelData): void
}

const AudioContainer: React.FC<Props> = (props) => {
  const [audio, playing, toggleAudio, loadFromFile] = useAudio();
  const [getCurrentAudioData] = useTwoChannelAnalyser(audio);
  const [audioSrc, setAudioSrc] = useState<File | undefined>();
  const [dataRefresher, setDataRefresher] = useState<NodeJS.Timeout | undefined>();

  /** Effect Hook for loading audio */
  useEffect(() => {
    if (!audioSrc) {
      return;
    }
    loadFromFile(audioSrc);
  }, [audioSrc]);

  /** Effect Hook for starting/stopping updates to the audio data */
  useEffect(() => {
    // TODO: this can probably be done in a cleaner way.
    // this is what causes the audio data to update: just an interval that checks the current audio data.
    if (playing) {
        const interval = setInterval(() => {
          updateCurrentAudioData();
        }, props.refreshInterval);
        setDataRefresher(interval);
    } else {
        if (dataRefresher) {
          clearInterval(dataRefresher);
          setDataRefresher(undefined);
        }
    }
}, [playing]);

  const parseAudioFile = (event: React.FormEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (!files || files.length === 0) {
      console.log('NO AUDIO FILE TO LOAD');
      return;
    }
    setAudioSrc(files[0]);
  }

  const updateCurrentAudioData = () => {
    if (playing) {
      const newData = getCurrentAudioData();
      // this sends the updated audio data back to the parent component.
      props.updateChannelData(newData);
    }
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column'}} className='audio-container'>
      <input type='file' accept='audio/*' onChange={parseAudioFile}></input>
      <button style={{flex: 1}} disabled={audioSrc === undefined} onMouseDown={toggleAudio}>{playing ? 'Stop' : 'Start'}</button>
    </div>
  );
}

export default AudioContainer;