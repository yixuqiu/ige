import { RandomTweener } from "./gameClasses/RandomTweener.js"
import { IgeBaseClass } from "../../engine/core/IgeBaseClass.js"
import { IgeScene2d } from "../../engine/core/IgeScene2d.js"
import { IgeTexture } from "../../engine/core/IgeTexture.js"
import { IgeViewport } from "../../engine/core/IgeViewport.js"
import { ige } from "../../engine/instance.js"
// @ts-ignore
window.ige = ige;
export class Client extends IgeBaseClass {
    classId = "Client";
    constructor() {
        super();
        void this.init();
    }
    async init() {
        // Load the game textures
        new IgeTexture("fairy", "../assets/textures/sprites/fairy.png");
        // Wait for our textures to load before continuing
        await ige.textures.whenLoaded();
        // Create the HTML canvas
        ige.engine.createFrontBuffer(true);
        // Start the engine
        await ige.engine.start();
        // Create the scene
        const scene1 = new IgeScene2d().id("scene1");
        // Create the main viewport
        new IgeViewport()
            .id("vp1")
            .autoSize(true)
            .scene(scene1)
            .drawBounds(true)
            .drawBoundsData(true)
            .mount(ige.engine);
        // Define a function that will be called when the
        // mouse cursor moves over one of our entities
        const overFunc = function () {
            this.highlight(true);
            this.drawBounds(true);
            this.drawBoundsData(true);
        };
        // Define a function that will be called when the
        // mouse cursor moves away from one of our entities
        const outFunc = function () {
            this.highlight(false);
            this.drawBounds(false);
            this.drawBoundsData(false);
        };
        // Create 100 random tweening entities and add
        // mouse over and mouse out event listeners to
        // them based on the functions we defined above,
        // then add them to the scene!
        for (let i = 0; i < 100; i++) {
            new RandomTweener()
                .id("fairy" + i)
                .depth(i)
                .width(100)
                .height(100)
                .texture(ige.textures.get("fairy"))
                .drawBounds(false)
                .drawBoundsData(false)
                .pointerOver(overFunc)
                .pointerOut(outFunc)
                .mount(scene1);
        }
    }
}
