
export interface CirclePoint {  // TODO: rework
    x: number;
    y: number;
    angle: number;
    dist: number;
}

export interface CirclePointContainer {
    up: CirclePoint[];
    down: CirclePoint[];
}

export interface CircleParams {
    centerX: number;
    centerY: number;
    radius: number;
}

export const getStartingCirclePoints = (
    circleParams: CircleParams,
    steps: number,
    angleExtra: number
): CirclePointContainer => {
    const { centerX, centerY, radius } = circleParams;

    const up: CirclePoint[] = [];
    const down: CirclePoint[] = [];
    // Create points
    const interval = 360 / steps;
    for(let angle = 0; angle < 360; angle += interval) {
        let distUp = 1.1;
        let distDown = 0.9;
    
        up.push({
            angle: angle + angleExtra,
            x: centerX + radius * Math.cos((-angle + angleExtra) * Math.PI / 180) * distUp,
            y: centerY + radius * Math.sin((-angle + angleExtra) * Math.PI / 180) * distUp,
            dist: distUp
        });
    
        down.push({
        angle: angle + angleExtra + 5,
        x: centerX + radius * Math.cos((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
        y: centerY + radius * Math.sin((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
        dist: distDown
        });
    }
    return {
        up,
        down
    }
}

// -------------
// Canvas stuff
// -------------

const drawLine = (ctx: CanvasRenderingContext2D, points: CirclePoint[]) => {
    if (points.length === 0) {
        return;
    }
  let origin = points[0];

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineJoin = 'round';
  ctx.moveTo(origin.x, origin.y);

  for (let i = 0; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.lineTo(origin.x, origin.y);
  ctx.stroke();
}

const connectPoints = (ctx: CanvasRenderingContext2D, pointsA: CirclePoint[], pointsB: CirclePoint[]) => {
  for (let i = 0; i < pointsA.length; i++) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.moveTo(pointsA[i].x, pointsA[i].y);
    ctx.lineTo(pointsB[i].x, pointsB[i].y);
    ctx.stroke();
  }
}

export const drawCircle = (
    ctx: CanvasRenderingContext2D,
    pointsUp: CirclePoint[],
    pointsDown: CirclePoint[]) => {
    drawLine(ctx, pointsUp);
    drawLine(ctx, pointsDown);
    connectPoints(ctx, pointsUp, pointsDown);
}

export const getUpdatedPoints = (
    pointsContainer: CirclePointContainer,
    circleParams: CircleParams,
    audioDataArrayL: Uint8Array,
    audioDataArrayR: Uint8Array,
    bufferLength: number
): CirclePointContainer => {
    const { up, down } = pointsContainer
    const newPointsUp = getNewPoints(
        up,
        audioDataArrayL,
        bufferLength,
        circleParams,
        1.1,
        0.8
    );
    const newPointsDown = getNewPoints(
        down,
        audioDataArrayR,
        bufferLength,
        circleParams,
        0.9,
        0.2
    );
    return {
        up: newPointsUp,
        down: newPointsDown
    }
}

// TODO: rename
const getNewPoints = (
    oldPoints: CirclePoint[],
    audioDataArray: Uint8Array,
    bufferLength: number,
    circleParams: CircleParams,
    baseDist: number,
    scalingFactor: number
): CirclePoint[] => {
    const { centerX, centerY, radius } = circleParams;
    const circumference = 2 * Math.PI * radius;
    return oldPoints.map(point => {
        const audioIdx = Math.ceil(point.angle * (bufferLength / (2 * circumference))) | 0;
        // normalize the audio data (8 bit, so max value is 255)
        const audioValue = audioDataArray[audioIdx] / 255;

        const newDist = baseDist + audioValue * scalingFactor;
        return {
            ...point,
            dist: newDist,
            x: centerX + radius * Math.cos(-point.angle * Math.PI / 180) * newDist,
            y: centerY + radius * Math.sin(-point.angle * Math.PI / 180) * newDist
        }
    })
}