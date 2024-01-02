export const height: number;
export const layers: ({
    data: number[];
    height: number;
    name: string;
    opacity: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
    objects?: undefined;
} | {
    height: number;
    name: string;
    objects: {
        gid: number;
        height: number;
        name: string;
        properties: {};
        type: string;
        width: number;
        x: number;
        y: number;
    }[];
    opacity: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
    data?: undefined;
})[];
export const orientation: string;
export const properties: {};
export const tileheight: number;
export const tilesets: {
    firstgid: number;
    image: string;
    imageheight: number;
    imagewidth: number;
    margin: number;
    name: string;
    properties: {};
    spacing: number;
    tileheight: number;
    tilewidth: number;
}[];
export const tilewidth: number;
export const version: number;
export const width: number;
