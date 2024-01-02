import { IgeEventingClass } from "./IgeEventingClass";

export declare class IgeComponent<EntityType = any> extends IgeEventingClass {
	_entity: EntityType;
	_options?: any;
	componentId: string;
	constructor(parent?: any, options?: any);
	destroy(): this;
}
