import { IgeTileMap2d } from "@/engine/core/IgeTileMap2d";
import { ResourceType } from "../enums/ResourceType";
import { FactoryBuilding1 } from "../entities/FactoryBuilding1";
import { FactoryBuilding2 } from "../entities/FactoryBuilding2";
import { FlagBuilding } from "../entities/FlagBuilding";
import { HouseBuilding1 } from "../entities/HouseBuilding1";
import { MiningBuilding } from "../entities/MiningBuilding";
import { StorageBuilding } from "../entities/StorageBuilding";

export declare const createStorageBuilding: (
	parent: IgeTileMap2d,
	id: string,
	tileX: number,
	tileY: number
) => StorageBuilding;
export declare const createMiningBuilding: (
	parent: IgeTileMap2d,
	id: string,
	tileX: number,
	tileY: number,
	resourceType: ResourceType
) => MiningBuilding;
export declare const createHouseBuilding1: (
	parent: IgeTileMap2d,
	id: string,
	tileX: number,
	tileY: number
) => HouseBuilding1;
export declare const createFactoryBuilding1: (
	parent: IgeTileMap2d,
	id: string,
	tileX: number,
	tileY: number
) => FactoryBuilding1;
export declare const createFactoryBuilding2: (
	parent: IgeTileMap2d,
	id: string,
	tileX: number,
	tileY: number
) => FactoryBuilding2;
export declare const createFlagBuilding: (
	parent: IgeTileMap2d,
	id: string,
	tileX: number,
	tileY: number
) => FlagBuilding;
