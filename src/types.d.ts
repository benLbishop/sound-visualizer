export interface Coordinate {
    x: number;
    y: number;
}

export interface CirclePointContainer {
    outerPoints: Coordinate[];
    innerPoints: Coordinate[];
}

export interface CircleParams {
    centerX: number;
    centerY: number;
    radius: number;
}

export interface ChannelData {
    left: Uint8Array;
    right: Uint8Array;
}