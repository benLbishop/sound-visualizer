import React from 'react';
import logo from './logo.svg';
import './App.css';
import Visualizer from './Visualizer';
import { getStartingCirclePoints, getUpdatedCirclePoints } from './circle';
import { CirclePointContainer } from './types';

// TODO: make these dynamic
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;
const radius = document.body.clientWidth <= 425 ? 120 : 160;
const steps = document.body.clientWidth <= 425 ? 60 : 120;

interface Props {}

interface State {
  running: boolean;
  pointsContainer: CirclePointContainer;
}
class App extends React.PureComponent<Props, State> {
  context: AudioContext;
  audio: HTMLAudioElement;
  splitter: ChannelSplitterNode;
  analyserL: AnalyserNode;
  analyserR: AnalyserNode;
  audioDataArrayL: Uint8Array;
  audioDataArrayR: Uint8Array;
  bufferLength: number;


  constructor(props: Props) {
    super(props);
    this.audio = new Audio();
    this.context = new AudioContext();
    this.splitter = this.context.createChannelSplitter();
    this.analyserL = this.context.createAnalyser();
    this.analyserR = this.context.createAnalyser();
    this.audioDataArrayL = new Uint8Array();
    this.audioDataArrayR = new Uint8Array();
    this.bufferLength = 0;
    this.state = {
      running: false,
      pointsContainer: getStartingCirclePoints({centerX, centerY, radius}, steps)
    }

    this._init();
  }

  componentDidMount() {
    setInterval(() => {
      this.updateAudioData()
    }, 50)
  }

  _init = () => {
    this.analyserL.fftSize = 8192;
    this.analyserR.fftSize = 8192;
    
    this.splitter.connect(this.analyserL, 0, 0);
    this.splitter.connect(this.analyserR, 1, 0);
    this.bufferLength = this.analyserL.frequencyBinCount;

    this.audioDataArrayL = new Uint8Array(this.bufferLength);
    this.audioDataArrayR = new Uint8Array(this.bufferLength);
  }

  loadAudio = () => {
    this.audio.loop = false;
    this.audio.autoplay = false;
    this.audio.crossOrigin = "anonymous";

    // call `handleCanplay` when it music can be played
    this.audio.addEventListener('canplay', this.handleCanplay);
    this.audio.src = "https://s3.eu-west-2.amazonaws.com/nelsoncodepen/Audiobinger_-_The_Garden_State.mp3";
    this.audio.load();
    this.setState({
      running: true
    })
  }

  handleCanplay = () => {
    // connect the audio element to the analyser node and the analyser node
    // to the main Web Audio context
    // TODO: why do I have to redo this init stuff?
    this.context = new AudioContext();
    this.splitter = this.context.createChannelSplitter();
    this.analyserL = this.context.createAnalyser();
    this.analyserR = this.context.createAnalyser();
    this._init();
    const source = this.context.createMediaElementSource(this.audio);
    source.connect(this.splitter);
    this.splitter.connect(this.context.destination);
  }

  toggleAudio = () => {
    if (this.state.running === false) {
      this.loadAudio();
      // TODO
      // document.querySelector('.call-to-action').remove();
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
      const newPointsContainer = getUpdatedCirclePoints(
        this.state.pointsContainer,
        {centerX, centerY, radius},
        this.audioDataArrayL,
        this.audioDataArrayR,
        this.bufferLength
      );
      this.setState({
        pointsContainer: newPointsContainer
      });
    }
  }

  render() {
    return (
      <div className="App">
        <Visualizer
          pointsContainer={this.state.pointsContainer}
          toggleAudio={this.toggleAudio}
        />
        <button className='play-button' onMouseDown={this.toggleAudio}>{this.audio.paused ? 'Start' : 'Stop'}</button>
      </div>
    );
  }
}

export default App;

// TODO: not sure if I need this
// document.body.addEventListener('touchend', function(ev) {
//   context.resume();
// });