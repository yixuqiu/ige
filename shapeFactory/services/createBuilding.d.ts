import { StorageBuilding } from "../entities/StorageBuilding";
import { FlagBuilding } from "../entities/FlagBuilding";
import { MiningBuilding } from "../entities/MiningBuilding";
import { ResourceType } from "../enums/ResourceType";
import { FactoryBuilding1 } from "../entities/FactoryBuilding1";
import { IgeTileMap2d } from "@/engine/core/IgeTileMap2d";
import { FactoryBuilding2 } from "../entities/FactoryBuilding2";
export declare const createStorageBuilding: (parent: IgeTileMap2d, id: string, tileX: number, tileY: number) => StorageBuilding;
export declare const createMiningBuilding: (parent: IgeTileMap2d, id: string, tileX: number, tileY: number, resourceType: ResourceType) => MiningBuilding;
export declare const createFactoryBuilding1: (parent: IgeTileMap2d, id: string, tileX: number, tileY: number) => FactoryBuilding1;
export declare const createFactoryBuilding2: (parent: IgeTileMap2d, id: string, tileX: number, tileY: number) => FactoryBuilding2;
export declare const createFlagBuilding: (parent: IgeTileMap2d, id: string, tileX: number, tileY: number) => FlagBuilding;
