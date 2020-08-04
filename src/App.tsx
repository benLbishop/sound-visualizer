import React from 'react';
import logo from './logo.svg';
import './App.css';
import Visualizer from './Visualizer';
import { getStartingCirclePoints, getUpdatedCirclePoints } from './circle';
import { CirclePointContainer, ChannelData } from './types';
import AudioContainer from './AudioContainer';

// TODO: make these dynamic
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;
const radius = document.body.clientWidth <= 425 ? 120 : 160;
const steps = document.body.clientWidth <= 425 ? 60 : 120;

interface Props {}

interface State {
  pointsContainer: CirclePointContainer;
}
class App extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      pointsContainer: getStartingCirclePoints({centerX, centerY, radius}, steps),
    }
  }

  updateVisualizer = (channelData: ChannelData) => {
    const newPointsContainer = getUpdatedCirclePoints(
      {centerX, centerY, radius},
      this.state.pointsContainer,
      channelData
    );
    this.setState({
      pointsContainer: newPointsContainer
    });
  }

  render() {
    return (
      <div className="App">
        <Visualizer
          pointsContainer={this.state.pointsContainer}
        />
        <AudioContainer
          updateChannelData={this.updateVisualizer}
        />
      </div>
    );
  }
}

export default App;

// TODO: not sure if I need this
// document.body.addEventListener('touchend', function(ev) {
//   context.resume();
// });