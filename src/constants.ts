const constants = {
    canvas: {
        OUTER_DEFAULT_DIST: 1.1,
        INNER_DEFAULT_DIST: 0.9,
        INNER_POINT_OFFSET: 5.0 * (Math.PI / 180.0), // slant of the line between points In Radians, clockwise, starting from true east.
        CIRCLE_ROTATION: (3 / 2) * Math.PI, // position of the lowest frequency. In radians, clockwise, starting from true east.
        OUTER_SCALING_FACTOR: 1.4,
        INNER_SCALING_FACTOR: 0.5,
        CIRCLE_COLOR: 'rgba(255,255,255,0.5)'
    }
}

export default constants;