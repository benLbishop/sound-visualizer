import React from 'react';
import './App.css';
import { ChannelData } from './types';
import Visualizer from './Visualizer';
import AudioContainer from './AudioContainer';

interface Props {}

interface State {
  channelData: ChannelData;
}

class App extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      channelData: {
        left: new Uint8Array(),
        right: new Uint8Array()
      }
    }
  }

  updateVisualizer = (channelData: ChannelData) => {
    this.setState({
      channelData
    });
  }

  render() {
    return (
      <div className="App">
        <Visualizer
          channelData={this.state.channelData}
        />
        <AudioContainer
          updateChannelData={this.updateVisualizer}
        />
      </div>
    );
  }
}

export default App;