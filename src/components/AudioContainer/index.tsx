import React, { FormEvent } from 'react';

import { ChannelData } from '../../types';
import constants from '../../constants';

import './AudioContainer.css';

interface Props {
  refreshInterval: number;
  updateChannelData(data: ChannelData): void
}

interface State {
  running: boolean;
}

class AudioContainer extends React.PureComponent<Props, State> {
  audio = new Audio();
  // NOTE: the audio context and the resulting dependencies are empty when this AudioContext
  // is used. I've only gotten this to work if I make a new AudioContext in handleCanPlay
  context = new AudioContext();
  splitter = this.context.createChannelSplitter();
  analyserL = this.context.createAnalyser();
  analyserR = this.context.createAnalyser();
  audioDataArrayL = new Uint8Array();
  audioDataArrayR = new Uint8Array();

  constructor(props: Props) {
    super(props);

    this.state = {
      running: false
    }
  }

  componentDidMount() {
    // TODO: this can probably be done in a cleaner way.
    // this is what causes the audio data to update.
    setInterval(() => {
      this.updateAudioData();
    }, this.props.refreshInterval);
  }

  initializeAnalysers = () => {
    // setup that I don't fully understand, but is necessary
    this.analyserL.fftSize = constants.audio.FFT_SIZE;
    this.analyserR.fftSize = constants.audio.FFT_SIZE;
    
    // pretty sure that the second param for this specifies which channel to connect the analyser to
    this.splitter.connect(this.analyserL, 0, 0);
    this.splitter.connect(this.analyserR, 1, 0);

    // set up the data arrays that will be used to read the frequencies
    const bufferLength = this.analyserL.frequencyBinCount;
    this.audioDataArrayL = new Uint8Array(bufferLength);
    this.audioDataArrayR = new Uint8Array(bufferLength);
  }

  loadAudio = (event: React.FormEvent<HTMLInputElement>) => {
    console.log('LOADING AUDIO');
    const files = event.currentTarget.files;
    if (!files || files.length === 0) {
      console.log('NO AUDIO FILE TO LOAD');
      return;
    }
    this.audio.loop = false;
    this.audio.autoplay = false;
    this.audio.crossOrigin = "anonymous";

    // call `handleCanPlay` when it music can be played
    this.audio.addEventListener('canplay', this.handleCanPlay);
    
    const reader = new FileReader();
    reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
      if (!readerEvent.target || typeof(readerEvent.target.result) !== 'string') {
        console.log('UNRECOGNIZED READEREVENT: ', readerEvent.target);
        return;
      }
      this.audio.src = readerEvent.target.result;
      this.audio.load();
    }
    reader.readAsDataURL(files[0]);

    this.setState({
      running: true
    })
  }

  handleCanPlay = () => {
    // connect the audio element to the analyser node and the analyser node
    // to the main Web Audio context

    // TODO: why do I have to do init stuff here? AudioContext is empty otherwise when it's created in constructor.
    this.context = new AudioContext();
    this.splitter = this.context.createChannelSplitter();
    this.analyserL = this.context.createAnalyser();
    this.analyserR = this.context.createAnalyser();
    this.initializeAnalysers();

    // connect the channel splitter to the audio that's playing to divide it into two tracks
    const source = this.context.createMediaElementSource(this.audio);
    source.connect(this.splitter);
    this.splitter.connect(this.context.destination);
  }

  toggleAudio = async () => {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  updateAudioData = () => {
    if (this.state.running) {
      // this checks what is currently playing and places the frequency spectrum
      // into the arrays audioDataArrayL and audioDataArrayR.
      this.analyserL.getByteFrequencyData(this.audioDataArrayL);
      this.analyserR.getByteFrequencyData(this.audioDataArrayR);
      // this sends the updated audio data back to the parent component.
      this.props.updateChannelData({
        left: this.audioDataArrayL,
        right: this.audioDataArrayR
      });
    }
  }

  render() {
    return (
      <div style={{display: 'flex', flexDirection: 'column'}} className='audio-container'>
        <input type='file' accept='audio/*' onChange={this.loadAudio}></input>
        <button style={{flex: 1}} onMouseDown={this.toggleAudio}>{this.audio.paused ? 'Start' : 'Stop'}</button>
      </div>
    )
  }
}

export default AudioContainer;