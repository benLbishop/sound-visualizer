import React from 'react';

import { ChannelData } from '../../types';
import AudioContainer from '../AudioContainer';
import constants from '../../constants';

import CircleVisualizer from '../CircleVisualizer';

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

  updateChannelData = (channelData: ChannelData) => {
    this.setState({
      channelData
    });
  }

  render() {
    return (
      <div style={{display: 'flex', width: '100%', height: '100%'}}>
        <CircleVisualizer
          channelData={this.state.channelData}
        />
        <AudioContainer
          refreshInterval={constants.audio.REFRESH_INTERVAL}
          updateChannelData={this.updateChannelData}
        />
      </div>
    );
  }
}

export default App;