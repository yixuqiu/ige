import { registerClass } from "../../engine/igeClassStore.js";
import { isClient } from "../../engine/clientServer.js";
import { UiRequiresProducesDisplay } from "./UiRequiresProducesDisplay.js";
import { ige } from "../../engine/instance.js";
import { Building } from "./base/Building.js";
export class HouseBuilding1 extends Building {
    constructor(tileX = NaN, tileY = NaN, produces, requires = []) {
        super();
        this.classId = "HouseBuilding1";
        this.tileX = tileX;
        this.tileY = tileY;
        this._produces = produces;
        this._requires = requires;
        this.layer(10);
        this.isometric(ige.data("isometric"));
        this.width(80);
        this.height(100);
        this.bounds3d(40, 40, 50);
        if (isClient) {
            this.uiResourceDisplay = new UiRequiresProducesDisplay(produces, requires).mount(this);
            this.texture(ige.textures.get("house1"));
        }
    }
    streamCreateConstructorArgs() {
        return [this.tileX, this.tileY, this._produces, this._requires];
    }
    _mounted(obj) {
        super._mounted(obj);
        if (!isNaN(this.tileX) && !isNaN(this.tileY)) {
            this.occupyTile(this.tileX + this.tileXDelta, this.tileY + this.tileYDelta, this.tileW, this.tileH);
        }
    }
}
registerClass(HouseBuilding1);
