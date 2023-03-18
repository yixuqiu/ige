import { IgeSmartFilter } from "../../types/IgeSmartFilter";
import { IgeCanvasRenderingContext2d } from "../../types/IgeCanvasRenderingContext2d";
export type IgeFilterHelperFunction = (...args: any[]) => any;
declare class IgeFilters {
    filter: Record<string, IgeSmartFilter>;
    helper: Record<string, IgeFilterHelperFunction>;
    tmpCanvas?: HTMLCanvasElement;
    tmpCtx?: IgeCanvasRenderingContext2d | null;
    constructor();
    getFilter(name: string): IgeSmartFilter | undefined;
    registerFilter(name: string, filter: IgeSmartFilter): void;
    getHelper(name: string): IgeFilterHelperFunction | undefined;
    registerHelper(name: string, filter: IgeFilterHelperFunction): void;
}
declare const _default: IgeFilters;
export default _default;
