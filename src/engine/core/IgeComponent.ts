import { IgeEventingClass } from "@/export/exports";

export class IgeComponent<EntityType = any> extends IgeEventingClass {
	_entity: EntityType;
	_options?: any;
	componentId: string = "IgeComponent";

	constructor (parent?: any, options?: any) {
		super();
		this._entity = parent;
		this._options = options;
	}

	destroy () {
		return this;
	}
}
