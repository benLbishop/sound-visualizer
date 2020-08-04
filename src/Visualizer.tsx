import React, { useEffect } from 'react';
import { drawCircleVisualizer } from './canvas';
import { CirclePointContainer } from './types';

import './Visualizer.css';

interface Props {
  pointsContainer: CirclePointContainer;
  toggleAudio(): void;
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
    draw(ctx);
  })

  const draw = (ctx: CanvasRenderingContext2D) => {
    const { innerPoints, outerPoints } = props.pointsContainer;
    drawCircleVisualizer(ctx, innerPoints, outerPoints);
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    props.toggleAudio();
  }

  return (
    <React.Fragment>
      <canvas
        ref={canvasRef}
        className='sound-circle'
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
      />
    </React.Fragment>
  );
}

export default Visualizer;