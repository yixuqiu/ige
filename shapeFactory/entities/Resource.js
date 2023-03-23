import { ige } from "../../engine/instance.js";
import { Circle } from "./base/Circle.js";
import { ResourceType } from "../enums/ResourceType.js";
import { registerClass } from "../../engine/igeClassStore.js";
import { IgeTimeout } from "../../engine/core/IgeTimeout.js";
import { isServer } from "../../engine/clientServer.js";
import { roadPathFinder } from "../services/roadPathFinder.js";
const fillColorByType = {
    [ResourceType.none]: "#000000",
    [ResourceType.wood]: "#006901",
    [ResourceType.grain]: "#ff00ea",
    [ResourceType.energy]: "#ff9900"
};
export class Resource extends Circle {
    constructor(type, locationId) {
        super();
        this._destinationId = "";
        this._pathIds = [];
        this.depth(4);
        this.data("fillColor", fillColorByType[type])
            .width(10)
            .height(10);
        this._type = type;
        this._locationId = locationId;
        if (isServer) {
            this.selectDestination();
            this.setNavigation();
        }
    }
    streamCreateConstructorArgs() {
        return [this._type, this._locationId];
    }
    selectDestination() {
        this._destinationId = "base1"; // The destination when no other building needs the resource at the moment
        // Check buildings to see if any need this resource at the moment
        const buildings = ige.$$("building");
        // If we have no buildings to scan, return, since destination will be the base
        if (!buildings.length)
            return;
        // Scan each building and ask if it needs this resource and if so, determine the closest one
        const needyList = buildings.filter((tmpBuilding) => tmpBuilding.needsResource(this._type));
        // If we have no buildings to send the resource to, return, since destination will be the base
        if (!needyList.length)
            return;
        const buildingWeWillDeliverTo = needyList[0];
        // Tell the building we are going to route the resource to it
        buildingWeWillDeliverTo.onResourceEnRoute(this._type);
        this._destinationId = buildingWeWillDeliverTo.id();
    }
    setNavigation() {
        if (this._destinationId) {
            this._location = ige.$(this._locationId);
            this._destination = ige.$(this._destinationId);
        }
        if (!this._location || !this._destination) {
            // Create a timeout to re-check
            new IgeTimeout(() => {
                this.setNavigation();
            }, 200);
            return;
        }
        this.onDropped(this._locationId);
    }
    onDropped(droppedLocationId) {
        var _a;
        this._location = ige.$(droppedLocationId);
        this._locationId = droppedLocationId;
        if (!this._location) {
            // Couldn't get current location, re-queue the check
            new IgeTimeout(() => {
                this.onDropped(droppedLocationId);
            }, 1000);
            return;
        }
        //console.log("Resource is located at", this._locationId);
        //console.log("Resource wants to get to", this._destinationId);
        if (this._locationId === this._destinationId) {
            //console.log("We got to our destination!");
            this._pathIds = [];
            // Tell the destination building we have arrived
            (_a = this._destination) === null || _a === void 0 ? void 0 : _a.onResourceArrived(this._type);
            // Destroy the resource
            this.destroy();
            return;
        }
        this.calculateTransportPath();
    }
    calculateTransportPath() {
        if (!this._location) {
            console.log("Resource cannot calculate transport path because we don't have a location");
            return;
        }
        this._pathIds = roadPathFinder(this._locationId, this._destinationId);
        if (this._pathIds.length === 0) {
            console.log("Resource cannot calculate transport path, retrying...");
            // We failed to find a path, queue a re-check
            new IgeTimeout(() => {
                this.calculateTransportPath();
            }, 1000);
            return;
        }
        //console.log("Resource path is", this._pathIds.toString());
        // Add resource to the current location's transport queue
        this._location.outboundQueue.push(this);
    }
    destroy() {
        delete this._location;
        delete this._destination;
        return super.destroy();
    }
}
registerClass(Resource);
