import { IgeComponent } from "../../../engine/core/IgeComponent.js";
export class IgeChatComponent extends IgeComponent {
    constructor() {
        super(...arguments);
        this.classId = "IgeChatComponent";
        this.componentId = "chat";
        this._rooms = {};
    }
}
