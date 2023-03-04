import IgeEntity from "../../engine/core/IgeEntity";
import { textures } from "../services/textures";

export class Square extends IgeEntity {
	classId = 'Square';

	constructor () {
		super();

		this.data("glowColor", "#00d0ff")
			.depth(1)
			.width(50)
			.height(50)
			.texture(textures.getTextureById("square"));
	}
}
