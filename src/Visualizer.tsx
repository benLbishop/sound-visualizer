import React, { useEffect } from 'react';
import { drawCircleVisualizer } from './canvas';
import { getCirclePoints } from './circle';
import { CirclePointContainer, ChannelData } from './types';

import './Visualizer.css';

// TODO: make these dynamic
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;
const radius = document.body.clientWidth <= 425 ? 120 : 160;
const steps = document.body.clientWidth <= 425 ? 60 : 120;

interface Props {
  channelData: ChannelData;
}

const Visualizer: React.FC<Props> = (props: Props) => {
  const canvasRef: React.MutableRefObject<HTMLCanvasElement | null> = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      // TODO
      console.log('no canvas');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // TODO
      console.log('no ctx');
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pointsContainer = getCirclePoints(
      {centerX, centerY, radius},
      props.channelData,
      steps
    );
    draw(ctx, pointsContainer);
  })

  const draw = (ctx: CanvasRenderingContext2D, pointsContainer: CirclePointContainer) => {
    const { innerPoints, outerPoints } = pointsContainer;
    drawCircleVisualizer(ctx, innerPoints, outerPoints);
  }

  return (
    <canvas
      ref={canvasRef}
      className='sound-circle'
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}

export default Visualizer;