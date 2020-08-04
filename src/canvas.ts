import { getCirclePoints } from './circle';
import { CirclePoint, CircleParams, ChannelData } from './types';
import constants from './constants';

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
    ctx.strokeStyle = constants.canvas.CIRCLE_COLOR;
    for (let i = 0; i < pointsA.length; i++) {
        ctx.beginPath();
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
    circleParams: CircleParams,
    channelData: ChannelData,
    numSteps: number
) => {
    const { innerPoints, outerPoints } = getCirclePoints(
        circleParams,
        channelData,
        numSteps
    );
    drawLine(ctx, innerPoints); // draw inner circle
    drawLine(ctx, outerPoints); // draw outer circle
    connectPoints(ctx, outerPoints, innerPoints); // draw connecting lines
}