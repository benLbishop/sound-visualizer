const constants = {
    circle: {
        base: {
            CIRCLE_ROTATION: (3 / 2) * Math.PI, // position of the lowest frequency. In radians, clockwise, starting from true east.
            STEP_THRESHOLD: 200, // if radius (in px) is below this, use SMALL_STEP
            SMALL_STEP: 60, // used if the window is pretty small
            NORMAL_STEP: 120 // used
        },
        inner: {
            DEFAULT_DIST: 0.9,
            SCALING_FACTOR: 0.5,
            POINT_OFFSET: 5.0 * (Math.PI / 180.0) // slant of the line between points In Radians, clockwise, starting from true east.
        },
        outer: {
            DEFAULT_DIST: 1.1,
            SCALING_FACTOR: 1.4
        },
    },
    audio: {
        FFT_SIZE: 8192,
        REFRESH_INTERVAL: 50, // controls how often the audio data will be polled
        outputChannels: {
            LEFT: 0,
            RIGHT: 1
        }
    }
}

export default constants;