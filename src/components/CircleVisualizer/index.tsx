import React, { useState } from 'react';

import { drawCircleVisualizer } from '../../lib/canvas';
import { ChannelData, CircleParams } from '../../types';
import constants from '../../constants';
import VisualizerCanvas from '../VisualizerCanvas';

import './CircleVisualizer.css';

interface Props {
  channelData: ChannelData;
}

const CircleVisualizer: React.FC<Props> = (props: Props) => {
  const [circleParams, setCircleParams] = useState<CircleParams>({
    centerX: 0,
    centerY: 0,
    radius: 0,
  });
  const [numSteps, setNumSteps] = useState(0);

  const updateCircleParams = (width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width / 2, height / 2) * 0.5;

    // limit the number of lines if our circle is too small
    const { STEP_THRESHOLD, SMALL_STEP, NORMAL_STEP } = constants.circle.base;
    const stepCount = radius <= STEP_THRESHOLD ? SMALL_STEP : NORMAL_STEP;
    setCircleParams({
      centerX,
      centerY,
      radius
    })
    setNumSteps(stepCount)
  }

  const drawCircle = (ctx: CanvasRenderingContext2D) => {
    drawCircleVisualizer(ctx, circleParams, props.channelData, numSteps);
  }

  return (
    <div id='circle-visualizer' style={{flex: 1}}>
      <VisualizerCanvas
        draw={drawCircle}
        updateDimensions={updateCircleParams}
      />
    </div>
  );
}

export default CircleVisualizer;