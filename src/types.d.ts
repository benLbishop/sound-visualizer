export interface CirclePoint {  // TODO: rework
    x: number;
    y: number;
    angle: number;
    dist: number;
}

export interface CirclePointContainer {
    outerPoints: CirclePoint[];
    innerPoints: CirclePoint[];
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