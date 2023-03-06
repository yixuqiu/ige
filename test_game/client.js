import { ige } from "../engine/instance.js";
import IgeBaseClass from "../engine/core/IgeBaseClass.js";
import IgeBaseScene from "../engine/core/IgeBaseScene.js";
import { Level1 } from "./levels/Level1.js";
import { textures } from "./services/textures.js";
import { IgeOptions } from "../engine/core/IgeOptions.js";
// @ts-ignore
window.ige = ige;
export class Client extends IgeBaseClass {
    constructor() {
        // Init the super class
        super();
        this.classId = "Client";
        const options = new IgeOptions();
        options.set("masterVolume", 1);
        ige.init();
        //ige.engine.addComponent(IgeEditorComponent);
        ige.audio.masterVolume(options.get('masterVolume', 1));
        //(ige.components.input as IgeInputComponent).debug(true);
        // Load the game textures
        textures.load();
        // Wait for our textures to load before continuing
        ige.textures.on('allLoaded', () => {
            // Create the HTML canvas
            ige.engine.createFrontBuffer(true);
            // Start the engine
            ige.engine.start((success) => {
                var _a;
                // Check if the engine started successfully
                if (success) {
                    // Load the base scene data
                    ige.engine.addGraph(IgeBaseScene);
                    // Add all the items in Scene1 to the scenegraph
                    // (see gameClasses/Scene1.js :: addGraph() to see
                    // the method being called by the engine and how
                    // the items are added to the scenegraph)
                    ige.engine.addGraph(Level1);
                    (_a = ige.network) === null || _a === void 0 ? void 0 : _a.start('http://localhost:2000', () => {
                        console.log("Connect result");
                    });
                }
            });
        });
    }
}
