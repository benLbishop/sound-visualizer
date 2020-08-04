import { CircleParams, CirclePoint, CirclePointContainer } from './types';
import constants from './constants';

/**
 * 
 * @param circleParams parameters defining the circle we'll be drawing.
 * @param numSteps the number of steps we want for our circle.
 */
export const getStartingCirclePoints = (circleParams: CircleParams, numSteps: number): CirclePointContainer => {
    const { centerX, centerY, radius } = circleParams;
    // offset the start of the circle so the bass frequencies are at the top
    const startAngle = constants.canvas.CIRCLE_ROTATION;
    const endAngle = startAngle + (2 * Math.PI);
    const interval = (2 * Math.PI) / numSteps; // we'll draw numSteps points this distance apart along the circle

    const innerPoints: CirclePoint[] = [];
    const outerPoints: CirclePoint[] = [];
    for(let angle = startAngle; angle < endAngle; angle += interval) {
        let innerDist = constants.canvas.OUTER_DEFAULT_DIST;
        let outerDist = constants.canvas.INNER_DEFAULT_DIST;

        outerPoints.push({
            angle,
            x: centerX + radius * Math.cos(angle) * outerDist,
            y: centerY + radius * Math.sin(angle) * outerDist,
            dist: outerDist
        });
        // offset the inner circle's points by a little bit
        const downAngle = angle + constants.canvas.INNER_POINT_OFFSET;
        innerPoints.push({
            angle: downAngle,
            x: centerX + radius * Math.cos(downAngle) * innerDist,
            y: centerY + radius * Math.sin(downAngle) * innerDist,
            dist: innerDist
        });
    }
    return {
        innerPoints,
        outerPoints
    }
}

export const getUpdatedPoints = (
    pointsContainer: CirclePointContainer,
    circleParams: CircleParams,
    audioDataArrayL: Uint8Array,
    audioDataArrayR: Uint8Array,
    bufferLength: number
): CirclePointContainer => {
    const { innerPoints, outerPoints } = pointsContainer
    const newInnerPoints = getNewPoints(
        innerPoints,
        audioDataArrayR,
        bufferLength,
        circleParams,
        constants.canvas.INNER_DEFAULT_DIST,
        constants.canvas.INNER_SCALING_FACTOR
    );
    const newOuterPoints = getNewPoints(
        outerPoints,
        audioDataArrayL,
        bufferLength,
        circleParams,
        constants.canvas.OUTER_DEFAULT_DIST,
        constants.canvas.OUTER_SCALING_FACTOR
    );
    return {
        innerPoints: newInnerPoints,
        outerPoints: newOuterPoints
    }
}

/**
 * Primarily used to draw the inner and outer circles for our display.
 * @param ctx the context for the canvas on which we're drawing.
 * @param points points containing the x,y coordinates for the line we want to draw.
 */
const drawLine = (ctx: CanvasRenderingContext2D, points: CirclePoint[]) => {
    if (points.length === 0) {
        // nothing to draw
        return;
    }
    // styling
    ctx.strokeStyle = constants.canvas.CIRCLE_COLOR;
    ctx.lineJoin = 'round';

    //start the path
    let origin = points[0];
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);

    // draw the line
    for (let i = 0; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    // connect the last point to the origin to close the shape
    ctx.lineTo(origin.x, origin.y);
    ctx.stroke();
}

/**
 * takes two equal-length arrays and draws lines between the points at the same indices.
 * @param ctx the context for the canvas on which we're drawing.
 * @param pointsA 
 * @param pointsB 
 */
const connectPoints = (ctx: CanvasRenderingContext2D, pointsA: CirclePoint[], pointsB: CirclePoint[]) => {
    for (let i = 0; i < pointsA.length; i++) {
        ctx.beginPath();
        ctx.strokeStyle = constants.canvas.CIRCLE_COLOR;
        ctx.moveTo(pointsA[i].x, pointsA[i].y);
        ctx.lineTo(pointsB[i].x, pointsB[i].y);
        ctx.stroke();
    }
}

/**
 * Main function for drawing the song visualization.
 * @param ctx the context for the canvas on which we're drawing.
 * @param innerPoints points defining the inner circle of the display.
 * @param outerPoints points defining the outer circle of the display.
 */
export const drawCircleVisualizer = (
    ctx: CanvasRenderingContext2D,
    innerPoints: CirclePoint[],
    outerPoints: CirclePoint[]
) => {
    drawLine(ctx, innerPoints); // draw inner circle
    drawLine(ctx, outerPoints); // draw outer circle
    connectPoints(ctx, outerPoints, innerPoints); // draw connecting lines
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