import React, { useEffect, useState } from 'react';

import { drawCircleVisualizer } from '../../lib/canvas';
import { useWindowSize } from '../../lib/sizing';
import { ChannelData, CircleParams } from '../../types';
import constants from '../../constants';

import './Visualizer.css';

interface Props {
  channelData: ChannelData;
}

const Visualizer: React.FC<Props> = (props: Props) => {
  const canvasRef: React.MutableRefObject<HTMLCanvasElement | null> = React.useRef(null);
  const [width, height] = useWindowSize();
  const [circleParams, setCircleParams] = useState<CircleParams>({
    centerX: 0,
    centerY: 0,
    radius: 0,
  });
  const [numSteps, setNumSteps] = useState(0);

  // called whenever the width and height fields change. Used for resizing the circle
  useEffect(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width / 2, height / 2) * 0.5;

    const { STEP_THRESHOLD, SMALL_STEP, NORMAL_STEP} = constants.canvas;
    const stepCount = radius <= STEP_THRESHOLD ? SMALL_STEP : NORMAL_STEP;
    setCircleParams({
        centerX,
        centerY,
        radius
    })
    setNumSteps(stepCount)
  }, [width, height])

  // called whenever anything changes. used for drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('no canvas');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('no ctx');
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawCircleVisualizer(ctx, circleParams, props.channelData, numSteps);
  })

  return (
    <canvas
      ref={canvasRef}
      className='sound-circle'
      width={width}
      height={height}
    />
  );
}

export default Visualizer;