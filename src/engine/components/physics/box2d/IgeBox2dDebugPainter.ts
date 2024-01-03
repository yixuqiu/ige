import type { IgeBox2dController } from "@/export/exports";
import { ige } from "@/export/exports";
import { IgeEntity } from "@/export/exports";
import { registerClass } from "@/export/exports";
import type { IgeCanvasRenderingContext2d } from "@/export/exports";

// TODO: Check if this is still supported with the new version of Box2d we are using. Does DrawDebugData() need calling?
export class IgeBox2dDebugPainter extends IgeEntity {
	classId = "IgeBox2dDebugPainter";
	_entity: IgeEntity;
	_options?: Record<any, any>;

	constructor (entity: IgeEntity, options?: Record<any, any>) {
		super();

		this._entity = entity;
		this._options = options;
	}

	tick (ctx: IgeCanvasRenderingContext2d) {
		if (this._parent && this._parent.isometricMounts()) {
			ctx.scale(1.414, 0.707); // This should be super-accurate now
			ctx.rotate((45 * Math.PI) / 180);
		}

		// TODO: This should use something like this.m_world.SetDebugDraw(g_debugDraw); instead now, where g_debugDraw is a Draw instance
		// @ts-ignore
		(ige.box2d as IgeBox2dController)._world?.DrawDebugData();

		super.tick(ctx);
	}
}

registerClass(IgeBox2dDebugPainter);
