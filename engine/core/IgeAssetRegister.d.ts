import IgeEventingClass from "./IgeEventingClass";
import { IgeAsset } from "./IgeAsset";
export declare class IgeAssetRegister<AssetType extends IgeAsset> extends IgeEventingClass {
    _assetById: Record<string, AssetType>;
    _assetsLoading: number;
    _assetsTotal: number;
    get(id: string): AssetType;
    add(id: string, item: AssetType): void;
    remove(id: string): void;
    addGroup(group: Record<string, AssetType>): void;
    removeGroup(group: Record<string, AssetType>): void;
    removeList(list: AssetType[]): void;
    whenLoaded(): Promise<boolean[]>;
}
