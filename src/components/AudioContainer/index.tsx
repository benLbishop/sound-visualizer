import React, { useState, useEffect } from 'react';

import { ChannelData } from '../../types';

import './AudioContainer.css';
import { useAudio } from '../../lib/audio';

interface Props {
  refreshInterval: number;
  updateChannelData(data: ChannelData): void
}

const AudioContainer: React.FC<Props> = (props) => {
  const [playing, toggle, loadSrc] = useAudio(props.refreshInterval, props.updateChannelData);

  const loadAudio = (event: React.FormEvent<HTMLInputElement>) => {
    console.log('LOADING AUDIO');
    const files = event.currentTarget.files;
    if (!files || files.length === 0) {
      console.log('NO AUDIO FILE TO LOAD');
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
      if (!readerEvent.target || typeof(readerEvent.target.result) !== 'string') {
        console.log('UNRECOGNIZED READEREVENT: ', readerEvent.target);
        return;
      }
      const audioSrc = readerEvent.target.result;
      loadSrc(audioSrc);
    }
    reader.readAsDataURL(files[0]);
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column'}} className='audio-container'>
      <input type='file' accept='audio/*' onChange={loadAudio}></input>
      <button style={{flex: 1}} onMouseDown={toggle}>{playing ? 'Stop' : 'Start'}</button>
    </div>
  );
}

export default AudioContainer;