import { arrPull } from "../services/utils.js";
const WithComponentMixin = (Base) => class extends Base {
    constructor() {
        super(...arguments);
        this.components = {};
        this._components = []; // TODO: Rename this to _componentsArr
    }
    /**
     * Creates a new instance of the component argument passing
     * the options argument to the component as it is initialised.
     * The new component instance is then added to "this" via
     * a property name that is defined in the component class as
     * "componentId".
     * @param {IgeBaseClass} component The class definition of the component.
     * @param ige
     * @param {Object=} options An options parameter to pass to the component
     * on init.
     * @example #Add the velocity component to an entity
     *     var entity = new IgeEntity();
     *     entity.addComponent(IgeVelocityComponent);
     *
     *     // Now that the component is added, we can access
     *     // the component via its namespace. Call the
     *     // "byAngleAndPower" method of the velocity component:
     *     entity.velocity.byAngleAndPower(degreesToRadians(20), 0.1);
     */
    addComponent(component, options) {
        if (component.componentTargetClass) {
            // Check that the entity we are adding this component to is the correct type
            if (this.constructor.name !== component.componentTargetClass) {
                throw new Error(`${component.constructor.name} expected to be added to instance of [${component.componentTargetClass}] but was added to [${this.constructor.name}]`);
            }
        }
        const newComponentInstance = new component(this._componentBase || this, options);
        this.components[newComponentInstance.componentId] = newComponentInstance;
        // Add the component reference to the class component array
        this._components = this._components || [];
        this._components.push(newComponentInstance);
        return this;
    }
    /**
     * Removes a component by its id.
     * @param {String} componentId The id of the component to remove.
     * @example #Remove a component by its id (namespace)
     *     var entity = new IgeEntity();
     *
     *     // Let's add the velocity component
     *     entity.addComponent(IgeVelocityComponent);
     *
     *     // Now that the component is added, let's remove
     *     // it via it's id ("velocity")
     *     entity.removeComponent('velocity');
     */
    removeComponent(componentId) {
        // If the component has a destroy method, call it
        const component = this.components[componentId];
        if (component && component.destroy) {
            component.destroy();
        }
        // Remove the component from the class component array
        if (this._components) {
            arrPull(this._components, component);
        }
        // Remove the component from the class object
        delete this.components[componentId];
        return this;
    }
};
export default WithComponentMixin;
