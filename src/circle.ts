import { CircleParams, CirclePoint, CirclePointContainer } from './types';
import constants from './constants';

/**
 * Converts an 8-bit audio value into a position on the circle display.
 * @param angle the angle of the current point on the circle.
 * @param circumference the circumference of the circle.
 * @param audioDataArray the array containing the current frequency values for the song. Should be created using AnalyserNode.getByteFrequencyData()
 * @param bufferLength the length of the audioDataArray.
 * @param baseDist if the dataArray returns a value of 0, this distance will be returned.
 * @param scalingFactor the weight given the the dataArray value.
 */
const convertAudioValueToDist = (
    angle: number,
    circumference: number,
    audioDataArray: Uint8Array,
    bufferLength: number,
    baseDist: number,
    scalingFactor: number
): number => {
    // TODO: how the heck does this make any sense. I don't know why the circumference is needed
    const rawIdx = angle * (180.0 / Math.PI) * (bufferLength / (2 * circumference))
    const audioIdx = Math.max(Math.ceil(rawIdx), 0);

    // normalize the audio data (8 bit, so converting from [0, 255] to [0, 1])
    const audioValue = audioDataArray[audioIdx] / 255;

    const newDist = baseDist + audioValue * scalingFactor;
    return newDist;
}

/**
 * Creates a new circle point.
 * @param circleParams the defining dimensions of the circle.
 * @param angle the angle on the circle for the point.
 * @param dist the distance from the center where the point lies.
 */
const createPoint = (
    circleParams: CircleParams,
    angle: number,
    dist: number
): CirclePoint => {
    const { centerX, centerY, radius } = circleParams;
    const x = centerX + radius * Math.cos(angle) * dist;
    const y = centerY + radius * Math.sin(angle) * dist
    return {
        angle,
        dist,
        x,
        y 
    };
}

/**
 * 
 * @param circleParams parameters defining the circle we'll be drawing.
 * @param numSteps the number of steps we want for our circle.
 */
export const getStartingCirclePoints = (circleParams: CircleParams, numSteps: number): CirclePointContainer => {
    // offset the start of the circle so the bass frequencies are at the top
    const startAngle = constants.canvas.CIRCLE_ROTATION;
    const endAngle = startAngle + (2 * Math.PI);
    const interval = (2 * Math.PI) / numSteps; // we'll draw numSteps points this distance apart along the circle

    const innerDist = constants.canvas.OUTER_DEFAULT_DIST;
    const outerDist = constants.canvas.INNER_DEFAULT_DIST;

    const innerPoints: CirclePoint[] = [];
    const outerPoints: CirclePoint[] = [];
    for (let angle = startAngle; angle < endAngle; angle += interval) {
        // offset the inner point angle by a bit as a visual effect
        const innerAngle = angle + constants.canvas.INNER_POINT_OFFSET;
        const innerPoint = createPoint(circleParams, innerAngle, innerDist);
        innerPoints.push(innerPoint);

        // outer point just uses the actual angle
        const outerPoint = createPoint(circleParams, angle, outerDist);
        outerPoints.push(outerPoint);
    }
    return {
        innerPoints,
        outerPoints
    }
}

/**
 * Creates the updated points for the display. Should be called when the audio data has changed. 
 * @param pointsContainer the old points in the display.
 * @param circleParams the defining dimensions of the circle.
 * @param audioDataArrayL the left channel of the audio.
 * @param audioDataArrayR the right channel of the audio.
 * @param bufferLength the length of the audio data arrays.
 */
export const getUpdatedCirclePoints = (
    pointsContainer: CirclePointContainer,
    circleParams: CircleParams,
    audioDataArrayL: Uint8Array,
    audioDataArrayR: Uint8Array,
    bufferLength: number
): CirclePointContainer => {
    const { innerPoints, outerPoints } = pointsContainer;
    const circumference = 2 * Math.PI * circleParams.radius;

    // for each point, convert the audio value corresponding to the point to
    // a distance from the center of the circle, and create the resulting new point
    const newInnerPoints = innerPoints.map(point => {
        const newDist = convertAudioValueToDist(
            point.angle,
            circumference,
            audioDataArrayL,
            bufferLength,
            constants.canvas.INNER_DEFAULT_DIST,
            constants.canvas.INNER_SCALING_FACTOR
        );
        return createPoint(circleParams, point.angle, newDist);
    })

    const newOuterPoints = outerPoints.map(point => {
        const newDist = convertAudioValueToDist(
            point.angle,
            circumference,
            audioDataArrayR,
            bufferLength,
            constants.canvas.OUTER_DEFAULT_DIST,
            constants.canvas.OUTER_SCALING_FACTOR
        );
        return createPoint(circleParams, point.angle, newDist);
    })

    return {
        innerPoints: newInnerPoints,
        outerPoints: newOuterPoints
    }
}