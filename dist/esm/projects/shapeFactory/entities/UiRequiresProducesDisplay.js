import { ige } from "@/engine/instance";
import { ResourceType } from "../enums/ResourceType";
import { IgeUiEntity } from "@/engine/core/IgeUiEntity";
export class UiRequiresProducesDisplay extends IgeUiEntity {
    _requiredResourceUiEntity = [];
    constructor(produces, requires = []) {
        super();
        this.drawBounds(false)
            .width(200)
            .height(20)
            .translateBy(0, -50, 0)
            .scaleTo(0.8, 0.8, 0.8);
        requires.forEach((requiresItem, index) => {
            this._requiredResourceUiEntity.push(new IgeUiEntity()
                .texture(ige.textures.get(requiresItem.type))
                .center((-20 * (index + 1) - 10))
                .width(30)
                .height(30)
                .mount(this));
        });
        if (produces !== ResourceType.none) {
            new IgeUiEntity()
                .texture(ige.textures.get("arrow"))
                .width(20)
                .height(15)
                .mount(this);
            new IgeUiEntity()
                .texture(ige.textures.get(produces))
                .center(30)
                .width(30)
                .height(30)
                .mount(this);
        }
    }
}
