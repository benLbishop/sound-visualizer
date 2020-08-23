import React, { useEffect } from 'react';

import { useWindowSize } from '../../lib/sizing';

interface Props {
  draw(ctx: CanvasRenderingContext2D): void;
  updateDimensions?(width: number, height: number): void;
}

const VisualizerCanvas: React.FC<Props> = (props: Props) => {
  const canvasRef: React.MutableRefObject<HTMLCanvasElement | null> = React.useRef(null);
  const [width, height] = useWindowSize();

  /** Effect hook for drawing. Called when anything changes */
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

    props.draw(ctx);
  })

  /** Effect hook for window size change. Used to pass any changed canvas dimensions to the parent */
  useEffect(() => {
    if (props.updateDimensions) {
      props.updateDimensions(width, height);
    }
  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
    />
  );
}

export default VisualizerCanvas;