import { IgeComponent } from "@/engine/core/IgeComponent";
import type { IgeEntity } from "@/engine/core/IgeEntity";
import type { IgeObject } from "@/engine/core/IgeObject";
import type { IgePathFinder } from "@/engine/core/IgePathFinder";
import { IgePathNode } from "@/engine/core/IgePathNode";
import { IgePoint3d } from "@/engine/core/IgePoint3d";
import type { IgeTileMap2d } from "@/engine/core/IgeTileMap2d";
import { ige } from "@/engine/instance";
import { isClient } from "@/engine/utils/clientServer";
import { distance } from "@/engine/utils/maths";
import { IgeBehaviourType, IgeEntityRenderMode, IgeMountMode } from "@/enums";
import type { IgeCanvasRenderingContext2d } from "@/types/IgeCanvasRenderingContext2d";
import type { IgeCompassDirection } from "@/types/IgeCompassDirection";
import type { IgeEntityBehaviourMethod } from "@/types/IgeEntityBehaviour";
import type { IgePathFinderComparisonCallback } from "@/types/IgePathFinderComparisonCallback";

const isoDirectionMap: { [key: string]: IgeCompassDirection } = {
	"E": "SE",
	"S": "SW",
	"W": "NW",
	"N": "NE",
	"NE": "E",
	"SW": "W",
	"NW": "N",
	"SE": "S"
};

/**
 * Handles entity path traversal. This component is supposed to be added
 * to individual entities wishing to traverse paths. When added to an entity
 * the component will add a behaviour to the entity that is called each update()
 * and will operate to move the entity along a defined path.
 */
export class IgePathComponent extends IgeComponent<IgeEntity> {
	classId = "IgePathComponent";
	componentId = "path";

	_tileMap?: IgeTileMap2d;
	_finder?: IgePathFinder;
	_dynamic: boolean = false;
	_lookAheadSteps?: number;
	_allowSquare: boolean = true;
	_allowDiagonal: boolean = true;
	_points: IgePathNode[] = [];
	_speed: number;
	_nextPointToProcess: number;
	_previousPointFrom: number;
	_currentPointFrom: number;
	_previousPointTo: number;
	_currentPointTo: number;
	_finished: boolean = false;
	_warnTime?: number;
	_active: boolean = false;
	_autoStop: boolean = false;
	_startTime?: number;
	_paused: boolean = false;
	_pauseTime?: number;
	_drawPath: boolean = false;
	_drawPathGlow: boolean = false;
	_drawPathText: boolean = false;
	_totalDistance?: number;
	_totalTime?: number;

	constructor (entity: IgeEntity, options?: any) {
		super(entity, options);

		this._speed = 1 / 1000;

		this._nextPointToProcess = 0;
		this._previousPointFrom = 0;
		this._currentPointFrom = 0;
		this._previousPointTo = 0;
		this._currentPointTo = 0;

		// Add the path behaviour to the entity
		entity.addBehaviour(IgeBehaviourType.preUpdate, "path", this._updateBehaviour);
	}

	_tileChecker: IgePathFinderComparisonCallback = () => true;

	/**
	 * Gets / sets the tile map that will be used when calculating paths.
	 * @param {IgeTileMap2d} val The tileMap to use for path calculations.
	 * @returns {*}
	 */
	tileMap = (val?: IgeTileMap2d): IgeTileMap2d | this | undefined => {
		if (val === undefined) {
			return this._tileMap;
		}

		this._tileMap = val;
		return this;
	};

	/**
	 * Gets / sets the pathfinder class instance used to generate paths.
	 * @param {IgePathFinder} val The pathfinder class instance to use to generate paths.
	 * @returns {*}
	 */
	finder = (val?: IgePathFinder): IgePathFinder | this | undefined => {
		if (val === undefined) {
			return this._finder;
		}

		val._allowDiagonal = this._allowDiagonal;
		val._allowSquare = this._allowSquare;

		this._finder = val;
		return this;
	};

	/**
	 * Gets / sets the dynamic mode enabled flag. If dynamic mode is enabled
	 * then at the end of every path point (reaching a point along the path)
	 * the pathfinder will evaluate the path by looking ahead and seeing if
	 * the path has changed (the points along the path have now been marked as
	 * cannot path on). If any point along the path up to the look-ahead value
	 * has been blocked, the path will auto re-calculate to avoid the new block.
	 *
	 * For dynamic mode to work you need to supply a pathfinder instance by
	 * calling .finder(), a point checker method by calling .pointChecker() and
	 * the number of look-ahead steps by calling .lookAheadSteps(). See the
	 * doc for those methods for usage and required arguments.
	 * @param {boolean} enable If set to true, enables dynamic mode.
	 * @returns {*}
	 */
	dynamic = (enable?: boolean) => {
		if (enable !== undefined) {
			this._dynamic = enable;
			return this;
		}

		return this._dynamic;
	};

	/**
	 * Gets / sets the tile checker method used when calculating paths.
	 * @param {Function=} val The method to call when checking if a tile is valid
	 * to traverse when calculating paths.
	 * @returns {*}
	 */
	tileChecker = (val?: IgePathFinderComparisonCallback) => {
		if (val !== undefined) {
			this._tileChecker = val;
			return this;
		}

		return this._tileChecker;
	};

	lookAheadSteps = (val?: number) => {
		if (val !== undefined) {
			this._lookAheadSteps = val;
			return this;
		}

		return this._lookAheadSteps;
	};

	/**
	 * Gets / sets the flag determining if a path can use N, S, E and W movement.
	 * @param {boolean=} val Set to true to allow, false to disallow.
	 * @returns {*}
	 */
	allowSquare = (val?: boolean) => {
		if (val !== undefined) {
			this._allowSquare = val;
			return this;
		}

		return this._allowSquare;
	};

	/**
	 * Gets / sets the flag determining if a path can use NW, SW, NE and SE movement.
	 * @param {boolean=} val Set to true to allow, false to disallow.
	 * @returns {*}
	 */
	allowDiagonal = (val?: boolean) => {
		if (val !== undefined) {
			this._allowDiagonal = val;
			return this;
		}

		return this._allowDiagonal;
	};

	/**
	 * Clears any existing path points and sets the path the entity will traverse
	 * from start to finish.
	 * @param {number} fromX The x tile to path from.
	 * @param {number} fromY The y tile to path from.
	 * @param {number} fromZ The z tile to path from.
	 * @param {number} toX The x tile to path to.
	 * @param {number} toY The y tile to path to.
	 * @param {number} toZ The z tile to path to.
	 * @param {boolean} [findNearest=false] If the destination is unreachable, when set to
	 * true this option will allow the pathfinder to return the closest path to the
	 * destination tile.
	 */
	set = (
		fromX: number,
		fromY: number,
		fromZ: number,
		toX: number,
		toY: number,
		toZ: number,
		findNearest: boolean = false
	): this => {
		// Clear existing path
		this.clear();

		if (!this._finder) throw new Error("No path finder (IgePathFinder) assigned to IgePathComponent");
		if (!this._tileMap) throw new Error("No tile map (IgeTileMap2d) assigned to IgePathComponent");

		this._finder._tileMap = this._tileMap;

		// Create a new path
		const path = this._finder.generate(
			new IgePathNode(fromX, fromY, fromZ, 0),
			new IgePathNode(toX, toY, toZ, 0),
			findNearest
		);

		this.addPoints(path);

		return this;
	};


	/**
	 * Adds a new location to path to. If an existing path is already in place,
	 * this will add the new location to the end of the path rather than
	 * overwriting the existing one.
	 *
	 * @param {number} x - The x-coordinate of the new path.
	 * @param {number} y - The y-coordinate of the new path.
	 * @param {number} z - The z-coordinate of the new path.
	 * @param {boolean} [allowInvalidDestination=false] - If true, the closest
	 * valid destination will be used if the specified destination is not
	 * valid, e.g. pathing past a wall tile might not be allowed so your
	 * character might want to be moved as close to the wall tile as is allowed.
	 * @returns {this} - The current instance of the component.
	 * @throws {Error} If no pathfinder (IgePathFinder) is assigned to IgePathComponent.
	 * @throws {Error} If no tile map (IgeTileMap2d) is assigned to IgePathComponent.
	 */
	add = (x: number, y: number, z: number, allowInvalidDestination: boolean = false): this => {
		if (!this._finder) throw new Error("No pathfinder (IgePathFinder) assigned to IgePathComponent");
		if (!this._tileMap) throw new Error("No tile map (IgeTileMap2d) assigned to IgePathComponent");

		// Get the endPoint of the current path
		let endPoint = this.getEndPoint(),
			shift = true;

		if (!endPoint) {
			// There is no existing path, detect current tile position
			endPoint = IgePathNode.fromPoint3d(this._tileMap.pointToTile(this._entity._translate));
			shift = false;
		}

		// Create a new path
		const path = this._finder.generate(
			endPoint,
			new IgePathNode(x, y, z, 0),
			allowInvalidDestination
		);

		if (shift) {
			// Remove the first tile, it's the last one on the list already
			path.shift();
		}

		this.addPoints(path);

		return this;
	};

	/**
	 * Sets a new destination for a path including the point currently being
	 * traversed if a path is active. This creates a smooth transition and
	 * flow of pointComplete events between the old and new paths
	 * @param {number} x The x tile to path to.
	 * @param {number} y The y tile to path to.
	 * @param {number} z The z tile to path to.
	 * @param {boolean} [allowInvalidDestination=false] - If true, the closest
	 * valid destination will be used if the specified destination is not
	 * valid, e.g. pathing past a wall tile might not be allowed so your
	 * character might want to be moved as close to the wall tile as is allowed.
	 */
	reRoute = (x: number, y: number, z: number, allowInvalidDestination: boolean = false): this => {
		if (!this._finder) throw new Error("No path finder (IgePathFinder) assigned to IgePathComponent");
		if (!this._tileMap) throw new Error("No tile map (IgeTileMap2d) assigned to IgePathComponent");

		// Get the endPoint of the current path
		const fromPoint = this.getFromPoint();
		let toPoint = this.getToPoint();

		if (!toPoint) {
			// There is no existing path, detect current tile position
			toPoint = IgePathNode.fromPoint3d(this._tileMap.pointToTile(this._entity._translate));
		}

		// Create a new path, making sure we include the points that we're currently working between
		const prePath = fromPoint ? [fromPoint] : [];
		const path = this._finder.generate(
			toPoint,
			new IgePathNode(x, y, z, 0),
			allowInvalidDestination
		);

		// Do nothing if the new path is empty or invalid
		if (path.length > 0) {
			this.clear();
			this.addPoints(prePath.concat(path));
		} else {
			this.log("Cannot reroute to an empty path!", "warning");
		}

		return this;
	};

	/**
	 * Adds a path array containing path points (IgePoint3d instances) to the points queue.
	 * @param {IgePathNode[]} [path] An array of path points.
	 * @return {*}
	 */
	addPoints = (path?: IgePathNode[]): this => {
		if (!path || !path.length) {
			return this;
		}

		this._points = this._points.concat(path);
		this._calculatePathData();

		return this;
	};

	/**
	 * Gets the path node point that the entity is travelling from.
	 * @return {IgePathNode} A new point representing the travelled from node.
	 */
	getFromPoint = (): IgePathNode => {
		return this._points[this._currentPointFrom];
	};

	/**
	 * Gets the path node point that the entity is travelling to.
	 * @return {IgePathNode} A new point representing the travelling to node.
	 */
	getToPoint = (): IgePathNode => {
		return this._points[this._currentPointTo];
	};

	/**
	 * Gets the current direction.
	 * @example #Get the direction of movement along the current path
	 *     // Create an entity and add the path component
	 *     var entity = new IgeEntity()
	 *         .addComponent(IgePathComponent);
	 *
	 *     // Create a path and add it to the entity
	 *     // ...
	 *     // Now get the current direction
	 *     var direction = entity.path.currentDirection();
	 * @return {string} A string such as N, S, E, W, NW, NE, SW, SE.
	 * If there is currently no direction then the return value is a blank string.
	 */
	getDirection = (): IgeCompassDirection | "" => {
		if (this._finished) {
			return "";
		}

		const cell = this.getToPoint();

		if (cell) {
			let dir = cell.direction;

			if (this._entity._renderMode === IgeEntityRenderMode.iso) {
				// Convert direction for isometric
				dir = isoDirectionMap[dir];
			}

			return dir;
		}

		return "";
	};

	/**
	 * Gets / sets the time towards the end of the path when the path
	 * component will emit a "almostComplete" event.
	 * @param {number=} ms The time in milliseconds to emit the event
	 * on before the end of the path.
	 * @return {*}
	 */
	warnTime = (ms?: number) => {
		if (ms !== undefined) {
			this._warnTime = ms;
			return this;
		}

		return this._warnTime;
	};

	/**
	 * Gets / sets the flag determining if the entity moving along
	 * the path will stop automatically at the end of the path.
	 * @param {boolean=} val If true, will stop at the end of the path.
	 * @return {*}
	 */
	autoStop = (val?: boolean) => {
		if (val !== undefined) {
			this._autoStop = val;
			return this;
		}

		return this._autoStop;
	};

	/**
	 * Gets / sets the speed at which the entity will traverse the path in pixels
	 * per second (world space).
	 * @param {number=} val
	 * @param startTime
	 * @return {*}
	 */
	speed = (val?: number, startTime?: number) => {
		let endPoint, restartPoint;

		if (val !== undefined) {
			this._speed = val / 1000;

			if (this._active) {
				restartPoint = this._points[this._nextPointToProcess];
				endPoint = this.getEndPoint();

				// Need to round the restart co-ordinates as the speed could have changed with an entity halfway between
				// points and this upsets the tile checker
				this.set(
					Math.round(restartPoint.x),
					Math.round(restartPoint.y),
					restartPoint.z,
					endPoint.x,
					endPoint.y,
					endPoint.z
				);
				this.restart(startTime || ige.engine._currentTime);
			}
			return this;
		}

		return this._speed;
	};

	/**
	 * Starts path traversal.
	 * @param {number=} startTime The time to start path traversal. Defaults
	 * to `ige.engine._currentTime` if no value is presented.
	 * @return {*}
	 */
	start = (startTime?: number) => {
		let startPoint: IgePathNode;

		if (!this._active) {
			this._active = true;
			this._finished = false;
			this._startTime = startTime || ige.engine._currentTime;

			this._calculatePathData();

			if (this._points.length > 1) {
				this._nextPointToProcess = 0;
				this._currentPointFrom = 0;
				this._currentPointTo = 1;

				startPoint = this._points[0];
				this.emit("started", this._entity, new IgePoint3d(startPoint.x, startPoint.y, startPoint.z), this._startTime);
			}
		} else {
			this._finished = false;
		}

		return this;
	};

	/**
	 * Restarts an existing path traversal, for example after we have changed the speed or given it a new set of points
	 * but don't want to consider it a new path and raise a new start event
	 * @param {number=} startTime The time to start path traversal. Defaults
	 * to ige.engine._currentTime if no value is presented.
	 * @return {*}
	 */
	restart = (startTime?: number) => {
		if (this._points.length > this._nextPointToProcess) {
			this._finished = false;

			if (!this._active) {
				this._active = true;
				this._startTime = startTime || ige.engine._currentTime;

				if (this._points.length > 1) {
					this._currentPointFrom = this._nextPointToProcess;
					this._currentPointTo = this._nextPointToProcess + 1;
				}
			}
		}

		return this;
	};

	/**
	 * Returns the last point of the last path in the path queue.
	 * @return {IgePoint3d}
	 */
	getEndPoint = (): IgePathNode => {
		return this._points[this._points.length - 1];
	};

	/**
	 * Pauses path traversal but does not clear the path queue or any path data.
	 * @return {*}
	 */
	pause = () => {
		this._active = false;
		this._paused = true;
		this._pauseTime = ige.engine._currentTime;

		this.emit("paused", this._entity);
		return this;
	};

	/**
	 * Clears all path queue and path data.
	 * @return {*}
	 */
	clear = () => {
		if (this._active) {
			this.stop();
		}

		this._nextPointToProcess = 0;
		this._previousPointFrom = 0;
		this._currentPointFrom = 0;
		this._previousPointTo = 0;
		this._currentPointTo = 0;
		this._points = [];

		this.emit("cleared", this._entity);
		return this;
	};

	/**
	 * Stops path traversal but does not clear the path
	 * queue or any path data.
	 * @return {*}
	 */
	stop = () => {
		//this.log('Setting pathing as inactive...');
		this._active = false;
		this._finished = true;
		this.emit("stopped", this._entity);

		return this;
	};

	/**
	 * Gets / sets the flag determining if the path component
	 * should draw the current path of the entity to the canvas
	 * on each tick. Useful for debugging paths.
	 * @param {boolean=} val If true, will draw the path.
	 * @return {*}
	 */
	drawPath = (val?: boolean) => {
		if (val !== undefined) {
			this._drawPath = val;

			if (val) {
				this._entity.addBehaviour(IgeBehaviourType.preTick, "path", this._tickBehaviour);
			} else {
				this._entity.removeBehaviour(IgeBehaviourType.preTick, "path");
			}

			return this;
		}

		return this._drawPath;
	};

	/**
	 * Gets / sets the flag that determines if the path that
	 * is drawn gets some added glow effects or not. Pure eye
	 * candy, completely pointless otherwise.
	 * @param {boolean=} val If true will add glow effects to the path.
	 * @return {*}
	 */
	drawPathGlow = (val?: boolean) => {
		if (val !== undefined) {
			this._drawPathGlow = val;
			return this;
		}

		return this._drawPathGlow;
	};

	/**
	 * Gets / sets the flag that determines if the path that
	 * is drawn gets some added labels or not.
	 * @param {boolean=} val If true will draw labels on each path point.
	 * @return {*}
	 */
	drawPathText = (val?: boolean) => {
		if (val !== undefined) {
			this._drawPathText = val;
			return this;
		}

		return this._drawPathText;
	};

	multiplyPoint = (point: IgePathNode | IgePoint3d) => {
		if (!this._entity._parent) return point;
		return point.multiply(this._entity._parent._tileWidth, this._entity._parent._tileHeight, this._entity._parent._tileDepth || 1);
	};

	dividePoint = (point: IgePathNode | IgePoint3d) => {
		if (!this._entity._parent) return point;
		return point.divide(this._entity._parent._tileWidth, this._entity._parent._tileHeight, this._entity._parent._tileDepth || 1);
	};

	transformPoint = (point: IgePathNode | IgePoint3d) => {
		if (!this._entity._parent) return point;
		return new IgePoint3d(
			point.x + this._entity._parent._tileWidth / 2,
			point.y + this._entity._parent._tileHeight / 2,
			point.z
		);
	};

	unTransformPoint = (point: IgePathNode | IgePoint3d) => {
		if (!this._entity._parent) return point;
		return new IgePoint3d(
			point.x - this._entity._parent._tileWidth / 2,
			point.y - this._entity._parent._tileHeight / 2,
			point.z
		);
	};

	/**
	 * The behaviour method executed each tick.
	 * @param entity
	 * @param {CanvasRenderingContext2D} ctx The canvas that is currently being
	 * rendered to.
	 * @private
	 */
	_updateBehaviour: IgeEntityBehaviourMethod = (entity: IgeObject, ctx: IgeCanvasRenderingContext2d) => {
		if (!this._active) return;
		if (this._startTime === undefined) return;
		if (this._totalTime === undefined) return;

		const currentTime = ige.engine._currentTime;
		const progressTime = currentTime - this._startTime;

		// Check if we should be processing paths
		if (
			this._active &&
			this._totalDistance !== 0 &&
			currentTime >= this._startTime &&
			(progressTime <= this._totalTime || !this._finished)
		) {
			const distanceTravelled = this._speed * progressTime;
			const pointArr = this._points;
			const pointCount = pointArr.length;

			let totalDistance = 0,
				pointIndex,
				pointFrom,
				pointTo,
				newPoint,
				dynamicResult,
				effectiveTime;

			// Loop points along the path and determine which points we are traversing between
			for (pointIndex = 0; pointIndex < pointCount; pointIndex++) {
				totalDistance += pointArr[pointIndex]._distanceToNext;

				if (totalDistance > distanceTravelled) {
					// Found points we are traversing
					this._finished = false;
					this._currentPointFrom = pointIndex;
					this._currentPointTo = pointIndex + 1;
					pointFrom = pointArr[pointIndex];
					pointTo = pointArr[pointIndex + 1];
					break;
				}
			}

			// Check if we have points to traverse between
			if (pointFrom && pointTo) {
				if (this._currentPointFrom !== this._previousPointFrom) {
					let pointNext, p;

					// Emit points complete
					while (this._nextPointToProcess < this._currentPointFrom) {
						p = this._nextPointToProcess++;
						effectiveTime = this._startTime + pointArr[p]._absoluteTimeToNext;

						const pointCurrent = pointArr[p];
						pointNext = pointArr[p + 1];
						newPoint = this.multiplyPoint(pointNext);
						newPoint = this.transformPoint(newPoint);

						// We must translate the entity at a minimum once per point to ensure it's coords are correct if a new path starts
						this._entity.translateToPoint(newPoint);

						this.emit(
							"pointComplete",
							this._entity,
							new IgePoint3d(pointCurrent.x, pointCurrent.y, pointCurrent.z),
							new IgePoint3d(pointNext.x, pointNext.y, pointNext.z),
							p,
							p + 1,
							effectiveTime
						);

						if (this._nextPointToProcess <= p) {
							// The path has restarted so bomb out and catch up next tick
							return;
						}
					}
				}

				// Check if we are in dynamic mode and if so, ensure our path is still valid
				if (this._dynamic) {
					dynamicResult = this._processDynamic(pointFrom, pointTo, pointArr[pointCount - 1]);

					if (dynamicResult === true) {
						// Re-assign the points to the new ones that the dynamic path
						// spliced into our points array
						const previousPointFrom = pointArr[this._previousPointFrom];
						pointFrom = pointArr[this._currentPointFrom];
						pointTo = pointArr[this._currentPointTo];

						this.emit(
							"pathRecalculated",
							this._entity,
							new IgePoint3d(previousPointFrom.x, previousPointFrom.y, previousPointFrom.z),
							new IgePoint3d(pointFrom.x, pointFrom.y, pointFrom.z)
						);
					}

					if (dynamicResult === -1) {
						// Failed to find a new dynamic path
						this._finished = true;
					}
				}

				// Calculate position along vector between the two points
				newPoint = this._positionAlongVector(
					pointFrom,
					pointTo,
					this._speed,
					pointFrom._deltaTimeToNext - (pointFrom._absoluteTimeToNext - progressTime)
				);

				newPoint = this.multiplyPoint(newPoint);
				newPoint = this.transformPoint(newPoint);

				// Translate the entity to the new path point
				this._entity.translateToPoint(newPoint);

				this._previousPointFrom = this._currentPointFrom;
				this._previousPointTo = this._currentPointTo;
			} else {
				let pointNext, p;

				this._currentPointFrom = pointCount - 1;
				this._currentPointTo = pointCount - 1;

				// Emit final points complete if remaining
				while (this._nextPointToProcess < this._currentPointFrom) {
					p = this._nextPointToProcess++;
					effectiveTime = this._startTime + pointArr[p]._absoluteTimeToNext;

					const pointCurrent = pointArr[p];
					pointNext = pointArr[p + 1];
					newPoint = this.multiplyPoint(pointNext);
					newPoint = this.transformPoint(newPoint);

					// We must translate the entity at a minimum once per point to ensure it's coords are correct if a new path starts
					this._entity.translateToPoint(newPoint);

					this.emit(
						"pointComplete",
						this._entity,
						new IgePoint3d(pointCurrent.x, pointCurrent.y, pointCurrent.z),
						new IgePoint3d(pointNext.x, pointNext.y, pointNext.z),
						p,
						p + 1,
						effectiveTime
					);

					if (this._nextPointToProcess <= p) {
						// The path has restarted so bomb out and catch up next tick
						return;
					}
				}

				this._previousPointFrom = pointCount - 1;
				this._previousPointTo = pointCount - 1;

				this._finished = true;
				effectiveTime = this._startTime + this._totalTime;

				const previousPointFrom = pointArr[this._previousPointFrom];
				this.emit(
					"pathComplete",
					this._entity,
					new IgePoint3d(previousPointFrom.x, previousPointFrom.y, previousPointFrom.z),
					effectiveTime
				);
			}
		} else if (this._active && this._totalDistance == 0 && !this._finished) {
			this._finished = true;
		}
	};

	_processDynamic = (pointFrom: IgePathNode, pointTo: IgePathNode, destinationPoint: IgePathNode) => {
		if (!this._finder) throw new Error("No path finder (IgePathFinder) assigned to IgePathComponent");
		if (!this._tileMap) throw new Error("No tile map (IgeTileMap2d) assigned to IgePathComponent");

		let newPathPoints: string | any[];

		// We are in dynamic mode, check steps ahead to see if they
		// have been blocked or not
		const tileCheckData = this._tileMap.map.tileData(pointTo.x, pointTo.y) || null;

		if (!this._tileChecker(tileCheckData, pointTo.x, pointTo.y, pointTo.z, null, null, null, null, true)) {
			// The new destination tile is blocked, recalculate path
			newPathPoints = this._finder.generate(
				new IgePathNode(pointFrom.x, pointFrom.y, pointFrom.z, 0),
				new IgePathNode(destinationPoint.x, destinationPoint.y, destinationPoint.z, 0),
				false
			);

			if (newPathPoints.length) {
				this.replacePoints(this._currentPointFrom, this._points.length - this._currentPointFrom, newPathPoints);
				return true;
			} else {
				// Cannot generate valid path, delete this path
				this.emit(
					"dynamicFail",
					this._entity,
					new IgePoint3d(pointFrom.x, pointFrom.y, pointFrom.z),
					new IgePoint3d(destinationPoint.x, destinationPoint.y, destinationPoint.z)
				);
				this.clear();

				return -1;
			}
		}

		return false;
	};

	_calculatePathData = () => {
		let totalDistance = 0,
			startPoint,
			pointFrom,
			pointTo,
			i;

		if (this._currentPointFrom === 0) {
			// always set the first point to be the current position
			startPoint = this._entity._translate.clone();
			startPoint = this.unTransformPoint(startPoint);
			startPoint = this.dividePoint(startPoint);
			this._points[0] = IgePathNode.fromPoint3d(startPoint);
		}

		// Calculate total distance to travel
		for (i = 1; i < this._points.length; i++) {
			pointFrom = this._points[i - 1];
			pointTo = this._points[i];
			pointFrom._distanceToNext = distance(pointFrom.x, pointFrom.y, pointTo.x, pointTo.y);

			totalDistance += Math.abs(pointFrom._distanceToNext);

			pointFrom._deltaTimeToNext = pointFrom._distanceToNext / this._speed;
			pointFrom._absoluteTimeToNext = totalDistance / this._speed;
		}

		this._totalDistance = totalDistance;
		this._totalTime = totalDistance / this._speed;

		return this;
	};

	/**
	 * Replaces a number of points in the current queue with the new points passed.
	 * @param {number} fromIndex The from index.
	 * @param {number} replaceLength The number of points to replace.
	 * @param {Array} newPoints The array of new points to insert.
	 */
	replacePoints = (fromIndex: number, replaceLength: number, newPoints: IgePathNode[]) => {
		this._points.splice(fromIndex, replaceLength, ...newPoints);
		this._calculatePathData();
	};

	_tickBehaviour: IgeEntityBehaviourMethod = (entity: IgeObject, ctx: IgeCanvasRenderingContext2d) => {
		if (!isClient) return;
		if (!this._tileMap) throw new Error("No tile map (IgeTileMap2d) assigned to IgePathComponent");

		const currentPath = this._points;

		let oldTracePathPoint;
		let tracePathPoint;
		let pathPointIndex;
		let tempPathText;

		if (currentPath.length) {
			if (currentPath && this._drawPath) {
				// Draw the current path
				ctx.save();

				oldTracePathPoint = undefined;

				for (pathPointIndex = 0; pathPointIndex < currentPath.length; pathPointIndex++) {
					ctx.strokeStyle = "#0096ff";
					ctx.fillStyle = "#0096ff";

					tracePathPoint = new IgePoint3d(
						currentPath[pathPointIndex].x,
						currentPath[pathPointIndex].y,
						currentPath[pathPointIndex].z
					);

					tracePathPoint = this.multiplyPoint(tracePathPoint);
					tracePathPoint = this.transformPoint(tracePathPoint);

					if (this._tileMap._mountMode === IgeMountMode.iso) {
						tracePathPoint = tracePathPoint.toIso();
					}

					if (!oldTracePathPoint) {
						// The starting point of the path
						ctx.beginPath();
						ctx.arc(tracePathPoint.x, tracePathPoint.y, 5, 0, Math.PI * 2, true);
						ctx.closePath();
						ctx.fill();
					} else {
						// Not the starting point
						if (this._drawPathGlow) {
							ctx.globalAlpha = 0.1;
							for (let k = 3; k >= 0; k--) {
								ctx.lineWidth = (k + 1) * 4 - 3.5;
								ctx.beginPath();
								ctx.moveTo(oldTracePathPoint.x, oldTracePathPoint.y);
								ctx.lineTo(tracePathPoint.x, tracePathPoint.y);

								if (pathPointIndex < this._currentPointTo) {
									ctx.strokeStyle = "#666666";
									ctx.fillStyle = "#333333";
								}
								if (k === 0) {
									ctx.globalAlpha = 1;
								}

								ctx.stroke();
							}
						} else {
							ctx.beginPath();
							ctx.moveTo(oldTracePathPoint.x, oldTracePathPoint.y);
							ctx.lineTo(tracePathPoint.x, tracePathPoint.y);

							if (pathPointIndex < this._currentPointTo) {
								ctx.strokeStyle = "#666666";
								ctx.fillStyle = "#333333";
							}

							ctx.stroke();
						}

						if (pathPointIndex === this._currentPointTo) {
							ctx.save();
							ctx.fillStyle = "#24b9ea";
							ctx.fillRect(tracePathPoint.x - 5, tracePathPoint.y - 5, 10, 10);

							if (this._drawPathText) {
								ctx.fillStyle = "#eade24";

								if (this._drawPathGlow) {
									// Apply shadow to the text
									ctx.shadowOffsetX = 1;
									ctx.shadowOffsetY = 2;
									ctx.shadowBlur = 4;
									ctx.shadowColor = "rgba(0, 0, 0, 1)";
								}

								tempPathText = "Entity: " + entity.id();
								ctx.fillText(
									tempPathText,
									tracePathPoint.x - Math.floor(ctx.measureText(tempPathText).width / 2),
									tracePathPoint.y + 16
								);

								tempPathText =
									"Point (" +
									currentPath[pathPointIndex].x +
									", " +
									currentPath[pathPointIndex].y +
									")";
								ctx.fillText(
									tempPathText,
									tracePathPoint.x - Math.floor(ctx.measureText(tempPathText).width / 2),
									tracePathPoint.y + 28
								);

								tempPathText =
									"Abs (" +
									Math.floor(entity._translate.x) +
									", " +
									Math.floor(entity._translate.y) +
									")";
								ctx.fillText(
									tempPathText,
									tracePathPoint.x - Math.floor(ctx.measureText(tempPathText).width / 2),
									tracePathPoint.y + 40
								);
							}

							ctx.restore();
						} else {
							ctx.fillRect(tracePathPoint.x - 2.5, tracePathPoint.y - 2.5, 5, 5);
						}
					}

					oldTracePathPoint = tracePathPoint;
				}

				ctx.restore();
			}
		}
	};

	getPreviousPoint = (val: number = 1) => {
		return this._points[this._currentPointFrom - val];
	};

	getNextPoint = (val: number = 1) => {
		return this._points[this._currentPointTo + val];
	};

	/**
	 * Calculates the position of the entity along a vector based on the speed
	 * of the entity and the delta time.
	 * @param {IgePoint3d} p1 Vector start point
	 * @param {IgePoint3d} p2 Vector end point
	 * @param {number} speed Speed along the vector
	 * @param {number} deltaTime The time between the last update and now.
	 * @return {IgePoint3d}
	 * @private
	 */
	_positionAlongVector = (p1: IgePoint3d, p2: IgePoint3d, speed: number, deltaTime: number): IgePoint3d => {
		const p1X = p1.x;
		const p1Y = p1.y;
		const p1Z = p1.z;

		const p2X = p2.x;
		const p2Y = p2.y;
		const p2Z = p2.z;

		const deltaX = p2X - p1X;
		const deltaY = p2Y - p1Y;
		const deltaZ = p2Z - p1Z;
		const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const normalisedX = deltaX / magnitude;
		const normalisedY = deltaY / magnitude;
		const normalisedZ = deltaZ / magnitude;

		if (deltaX !== 0 || deltaY !== 0 || deltaZ !== 0) {
			return new IgePoint3d(
				p1X + normalisedX * (speed * deltaTime),
				p1Y + normalisedY * (speed * deltaTime),
				p1Z + normalisedZ * (speed * deltaTime)
			);
		}

		return new IgePoint3d(0, 0, 0);
	};
}
