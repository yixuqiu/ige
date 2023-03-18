import { IgeTextureMap } from "./IgeTextureMap";
/**
 * Texture maps provide a way to display textures across a tile map.
 */
export declare class IgeTextureAtlas extends IgeTextureMap {
    classId: string;
    constructor(tileWidth?: number, tileHeight?: number);
    /**
     * Get / set the data source that the atlas system will use
     * to retrieve new map data when required.
     * @param {String, Object} ds The url of the data source API
     * endpoint or the actual map data object.
     * @return {*}
     */
    dataSource(ds: any): any;
    /**
     * Gets / sets the extra data to load around the main texture map size to
     * try to mitigate loading times on new data.
     * @param {Number} x The number of pixels along the x axis to load.
     * @param {Number} y The number of pixels along the y axis to load.
     * @return {*}
     */
    bufferZone(x: any, y: any): this | {
        x: any;
        y: any;
    };
}
