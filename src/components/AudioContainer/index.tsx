import React from 'react';

import { ChannelData } from '../../types';

import './AudioContainer.css';
import { useAudio } from '../../lib/audio';

interface Props {
  refreshInterval: number;
  updateChannelData(data: ChannelData): void
}

const AudioContainer: React.FC<Props> = (props) => {
  const [playing, toggleAudio, loadFromFile] = useAudio(props.refreshInterval, props.updateChannelData);

  const loadAudio = (event: React.FormEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (!files || files.length === 0) {
      console.log('NO AUDIO FILE TO LOAD');
      return;
    }
    loadFromFile(files[0]);
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column'}} className='audio-container'>
      <input type='file' accept='audio/*' onChange={loadAudio}></input>
      <button style={{flex: 1}} onMouseDown={toggleAudio}>{playing ? 'Stop' : 'Start'}</button>
    </div>
  );
}

export default AudioContainer;