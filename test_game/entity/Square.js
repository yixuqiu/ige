import IgeEntity from "../../engine/core/IgeEntity.js";
import { textures } from "../services/textures.js";
export class Square extends IgeEntity {
    constructor() {
        super();
        this.classId = 'Square';
        this.data("glowColor", "#00d0ff")
            .depth(1)
            .width(50)
            .height(50)
            .texture(textures.getTextureById("square"));
    }
}
