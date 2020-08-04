import { CircleParams, CirclePoint, CirclePointContainer } from './types';
import constants from './constants';

export const getStartingCirclePoints = (circleParams: CircleParams, steps: number): CirclePointContainer => {
    const { centerX, centerY, radius } = circleParams;
    const startAngle = constants.canvas.CIRCLE_ROTATION;
    const endAngle = startAngle + (2 * Math.PI);
    const interval = (2 * Math.PI) / steps;

    const up: CirclePoint[] = [];
    const down: CirclePoint[] = [];
    for(let angle = startAngle; angle < endAngle; angle += interval) {
        let distUp = constants.canvas.UP_DEFAULT_DIST;
        let distDown = constants.canvas.DOWN_DEFAULT_DIST;
    
        up.push({
            angle,
            x: centerX + radius * Math.cos(angle) * distUp,
            y: centerY + radius * Math.sin(angle) * distUp,
            dist: distUp
        });
        // offset the inner circle's points by a little bit
        const downAngle = angle + constants.canvas.CIRCLE_POINT_OFFSET;
        down.push({
            angle: downAngle,
            x: centerX + radius * Math.cos(downAngle) * distDown,
            y: centerY + radius * Math.sin(downAngle) * distDown,
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
        // nothing to draw
        return;
    }
    let origin = points[0];

    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.strokeStyle = constants.canvas.CIRCLE_COLOR;
    ctx.lineJoin = 'round';

    for (let i = 0; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    // connect the last point to the first point we drew
    ctx.lineTo(origin.x, origin.y);
    ctx.stroke();
}

const connectPoints = (ctx: CanvasRenderingContext2D, pointsA: CirclePoint[], pointsB: CirclePoint[]) => {
    for (let i = 0; i < pointsA.length; i++) {
        ctx.beginPath();
        ctx.strokeStyle = constants.canvas.CIRCLE_COLOR;
        ctx.moveTo(pointsA[i].x, pointsA[i].y);
        ctx.lineTo(pointsB[i].x, pointsB[i].y);
        ctx.stroke();
    }
}

export const drawCircle = (
    ctx: CanvasRenderingContext2D,
    pointsUp: CirclePoint[],
    pointsDown: CirclePoint[]
) => {
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
        constants.canvas.UP_DEFAULT_DIST,
        constants.canvas.OUTER_SCALING_FACTOR
    );
    const newPointsDown = getNewPoints(
        down,
        audioDataArrayR,
        bufferLength,
        circleParams,
        constants.canvas.DOWN_DEFAULT_DIST,
        constants.canvas.INNER_SCALING_FACTOR
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
        // TODO: how the heck does this make any sense
        const rawIdx = point.angle * (180.0 / Math.PI) * (bufferLength / (2 * circumference))
        const audioIdx = Math.max(Math.ceil(rawIdx), 0);

        // normalize the audio data (8 bit, so max value is 255)
        const audioValue = audioDataArray[audioIdx] / 255;

        const newDist = baseDist + audioValue * scalingFactor;
        return {
            ...point,
            dist: newDist,
            x: centerX + radius * Math.cos(point.angle) * newDist,
            y: centerY + radius * Math.sin(point.angle) * newDist
        }
    })
}