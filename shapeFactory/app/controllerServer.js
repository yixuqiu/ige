var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ige } from "@/engine/instance";
import { BuildingType } from "../enums/BuildingType";
import { createFactoryBuilding1, createFactoryBuilding2, createFlagBuilding, createHouseBuilding1, createMiningBuilding, createStorageBuilding } from "../services/createBuilding";
import { newIdHex } from "@/engine/utils";
import { Road } from "../entities/Road";
import { Transporter } from "../entities/Transporter";
export const controllerServer = () => __awaiter(void 0, void 0, void 0, function* () {
    const tileMap1 = ige.$("tileMap1");
    const createBuilding = (data, clientId, requestCallback) => __awaiter(void 0, void 0, void 0, function* () {
        const buildingType = data.buildingType;
        const x = data.x;
        const y = data.y;
        switch (buildingType) {
            case BuildingType.storage: {
                const building = createStorageBuilding(tileMap1, newIdHex(), x, y);
                return requestCallback(building.id());
            }
            case BuildingType.flag: {
                const building = createFlagBuilding(tileMap1, newIdHex(), x, y);
                return requestCallback(building.id());
            }
            case BuildingType.factory1: {
                const building = createFactoryBuilding1(tileMap1, newIdHex(), x, y);
                return requestCallback(building.id());
            }
            case BuildingType.factory2: {
                const building = createFactoryBuilding2(tileMap1, newIdHex(), x, y);
                return requestCallback(building.id());
            }
            case BuildingType.mine: {
                console.log("Create mine", data.resourceType);
                const building = createMiningBuilding(tileMap1, newIdHex(), x, y, data.resourceType);
                return requestCallback(building.id());
            }
            case BuildingType.house1: {
                console.log("Create house 1", data.resourceType);
                const building = createHouseBuilding1(tileMap1, newIdHex(), x, y, data.resourceType);
                return requestCallback(building.id());
            }
        }
    });
    const createRoad = (data, clientId, requestCallback) => __awaiter(void 0, void 0, void 0, function* () {
        const fromId = data.fromId;
        const toId = data.toId;
        const road = new Road(fromId, toId).mount(tileMap1);
        // Create the transporter
        const base = ige.$("base1");
        new Transporter(base.id(), fromId, toId)
            .translateTo(base._translate.x, base._translate.y, 0)
            .mount(tileMap1);
        requestCallback(road.id());
    });
    const debug = () => {
        const resources = ige.$$("resource");
        debugger;
    };
    ige.network.define("createBuilding", createBuilding);
    ige.network.define("createRoad", createRoad);
    ige.network.define("debug", debug);
    return () => __awaiter(void 0, void 0, void 0, function* () {
    });
});
