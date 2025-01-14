import type { EntityPublicGameData } from "./GameEntity";
import { GameEntity } from "./GameEntity";
import { ThrustParticle } from "./particles/ThrustParticle";
import { isClient, isServer } from "@/engine/clientServer";
import { IgeParticleEmitter } from "@/engine/core/IgeParticleEmitter";
import { IgePoint3d } from "@/engine/core/IgePoint3d";
import { IgePoly2d } from "@/engine/core/IgePoly2d";
import type { IgeScene2d } from "@/engine/core/IgeScene2d";
import { ige } from "@/engine/exports";
import { IgeBox2dBodyType } from "@/enums/IgeBox2dBodyType";
import { IgeBox2dFixtureShapeType } from "@/enums/IgeBox2dFixtureShapeType";
import type { IgeBox2dFixtureDef } from "@/types/IgeBox2dFixtureDef";
import type { IgeCanvasRenderingContext2d } from "@/types/IgeCanvasRenderingContext2d";

export class Ship extends GameEntity {
	classId = "Ship";
	thrustEmitter?: IgeParticleEmitter;
	triangles?: IgePoly2d[];

	constructor (publicGameData?: EntityPublicGameData) {
		super(publicGameData);

		this.streamProperty("thrusting", false);
		this.category("ship");

		this.layer(2).width(40).height(40);

		if (isServer) {
			// Define the polygon for collision
			this._definePhysics();
		}

		if (isClient) {
			this.texture(ige.textures.get("ship1"));

			this.thrustEmitter = new IgeParticleEmitter()
				// Set the particle entity to generate for each particle
				.particle(ThrustParticle)
				// Set particle life to 300ms
				.lifeBase(600)
				// Set output to 60 particles a second (1000ms)
				.quantityBase(60)
				.quantityTimespan(1000)
				.scaleBaseX(1)
				.scaleBaseY(1)
				// Set the particle's death opacity to zero so it fades out as it's lifespan runs out
				.deathOpacityBase(0)
				// Set velocity vector to y = 0.02, with variance values
				.velocityVector(
					new IgePoint3d(0, 0.01, 0),
					new IgePoint3d(-0.08, 0.01, 0),
					new IgePoint3d(0.08, 0.05, 0)
				)
				// Mount new particles to the object scene
				.particleMountTarget(ige.$("frontScene") as IgeScene2d)
				// Move the particle emitter to the bottom of the ship
				.translateTo(0, 16, 0)
				// Mount the emitter to the ship
				.mount(this);
		}

		this._setup();
	}

	_definePhysics () {
		const collisionPoly = new IgePoly2d()
			.addPoint(0, -this._bounds2d.y2)
			.addPoint(this._bounds2d.x2, this._bounds2d.y2 - 7)
			.addPoint(0, this._bounds2d.y2 - 2)
			.addPoint(-this._bounds2d.x2, this._bounds2d.y2 - 7);

		// Scale the polygon by the box2d scale ratio
		collisionPoly.divide(ige.box2d._scaleRatio);

		// Now convert this polygon into an array of triangles
		this.triangles = collisionPoly.triangulate();

		// Create an array of box2d fixture definitions
		// based on the triangles
		const fixDefs: IgeBox2dFixtureDef[] = [];

		for (let i = 0; i < this.triangles.length; i++) {
			fixDefs.push({
				density: 0.2,
				friction: 1.0,
				restitution: 0.2,
				filter: {
					categoryBits: 0x0001,
					maskBits: 0xffff & ~0x0008
				},
				shape: {
					type: IgeBox2dFixtureShapeType.polygon,
					data: this.triangles[i]
				}
			});
		}

		// Create box2d body for this object
		this.box2dBody({
			type: IgeBox2dBodyType.dynamic,
			linearDamping: this._publicGameData.state.linearDamping.min,
			angularDamping: 0.5,
			allowSleep: true,
			bullet: false,
			gravitic: true,
			fixedRotation: false,
			fixtures: fixDefs
		});
	}

	/**
	 * Called every frame by the engine when this entity is mounted to the
	 * scenegraph.
	 * @param ctx The canvas context to render to.
	 * @param tickDelta
	 */
	update (ctx: IgeCanvasRenderingContext2d, tickDelta: number) {
		if (!isServer) {
			if (this.streamProperty("thrusting")) {
				this.thrustEmitter?.start();
			} else {
				this.thrustEmitter?.stop();
			}
		}

		super.update(ctx, tickDelta);
	}
}
