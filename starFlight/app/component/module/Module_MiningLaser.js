import { ige } from "../../../../engine/instance.js";
import { Module_Ability } from "./Module_Ability.js";
import { registerClass } from "../../../../engine/igeClassStore.js";
export class Module_MiningLaser extends Module_Ability {
    constructor() {
        super(...arguments);
        this.classId = "Module_MiningLaser";
        this._target = null;
    }
    /**
     * Called when the module has been active for a set period of time
     * and completes its task.
     */
    complete() {
        const target = this._target;
        const attachedTo = this.attachedTo();
        if (!attachedTo)
            return;
        const inventorySpace = attachedTo._publicGameData.state.inventorySpace;
        const inventoryCount = attachedTo._inventory.count();
        // Remove the mining laser target entity
        this._target = null;
        // Get new ore type randomly
        const oreType = target.removeRandomOreType();
        // Check if the player's hold has space for our mined ore
        if (inventorySpace && inventorySpace.val > 0 && inventorySpace.val - inventoryCount > 0) {
            // The ship has cargo space available, add the ore directly to inventory
            this.attachedTo()._inventory.post({
                "type": "ore",
                "meta": {
                    "type": target.removeRandomOreType()
                }
            });
            ige.network.send("msg", { msg: "Mined " + oreType + ", in cargo hold" }, this.attachedTo().clientId());
            return;
        }
        // Generate ore from asteroid (which is stored in this._target)
        target.spawnMinedOre(oreType);
        ige.network.send("msg", { msg: "Mined " + oreType + ", no space in cargo hold" }, this.attachedTo().clientId());
    }
}
registerClass(Module_MiningLaser);
