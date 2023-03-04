import IgeEntity from "../../engine/core/IgeEntity";
import {ige} from "../../engine/instance";

export class Rotator extends IgeEntity {
	classId = 'Rotator';
	_rSpeed: number = 0;

	constructor (speed: number) {
		super();

		if (speed !== undefined) {
			this._rSpeed = speed;
		} else {
			this._rSpeed = 0;
		}
	}

	/**
	 * Called every frame by the engine when this entity is mounted to the scenegraph.
	 * @param ctx The canvas context to render to.
	 */
	tick (ctx: CanvasRenderingContext2D) {
		// Rotate this entity by 0.1 degrees.
		this.rotateBy(0, 0, (this._rSpeed * ige._tickDelta) * Math.PI / 180);

		// Call the IgeEntity (super-class) tick() method
		super.tick(ctx);
	}
}
