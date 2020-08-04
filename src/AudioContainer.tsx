import React from 'react';
import constants from './constants';
import { ChannelData } from './types';

import './AudioContainer.css';

interface Props {
  updateChannelData(data: ChannelData): void
}

interface State {
  running: boolean;
}

class AudioContainer extends React.PureComponent<Props, State> {
  audio = new Audio();
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
    this.initializeAnalysers();
  }

  componentDidMount() {
    setInterval(() => {
      this.updateAudioData()
    }, 50)
  }

  initializeAnalysers = () => {
    this.analyserL.fftSize = 8192;
    this.analyserR.fftSize = 8192;
    
    this.splitter.connect(this.analyserL, 0, 0);
    this.splitter.connect(this.analyserR, 1, 0);
    const bufferLength = this.analyserL.frequencyBinCount;

    this.audioDataArrayL = new Uint8Array(bufferLength);
    this.audioDataArrayR = new Uint8Array(bufferLength);
  }

  loadAudio = (audioSrc: string) => {
    this.audio.loop = false;
    this.audio.autoplay = false;
    this.audio.crossOrigin = "anonymous";

    // call `handleCanplay` when it music can be played
    this.audio.addEventListener('canplay', this.handleCanplay);
    this.audio.src = audioSrc;
    this.audio.load();
    this.setState({
      running: true
    })
  }

  handleCanplay = () => {
    // connect the audio element to the analyser node and the analyser node
    // to the main Web Audio context

    // TODO: why do I have to redo this init stuff? AudioContext is empty otherwise when created in constructor.
    this.context = new AudioContext();
    this.splitter = this.context.createChannelSplitter();
    this.analyserL = this.context.createAnalyser();
    this.analyserR = this.context.createAnalyser();
    this.initializeAnalysers();

    const source = this.context.createMediaElementSource(this.audio);
    source.connect(this.splitter);
    this.splitter.connect(this.context.destination);
  }

  toggleAudio = () => {
    if (this.state.running === false) {
      // TODO: have an input for choosing the song
      this.loadAudio(constants.audio.TEST_SONG);
    }
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  updateAudioData = () => {
    this.analyserL.getByteFrequencyData(this.audioDataArrayL);
    this.analyserR.getByteFrequencyData(this.audioDataArrayR);
    if (this.state.running) {
      this.props.updateChannelData({
        left: this.audioDataArrayL,
        right: this.audioDataArrayR
      });
    }
  }

  render() {
    return (
      <button className='play-button' onMouseDown={this.toggleAudio}>{this.audio.paused ? 'Start' : 'Stop'}</button>
    )
  }
}

export default AudioContainer;