import Color3 from "./color3.js";
import Tile from "./tile.js";
import Vector2 from "./vector2.js";

const stepColorMapping = {
    "traversal": new Color3(210,136,232),
};

export default class StepTrack {
    constructor() {
        this.steps = [];
    }
    
    /**
     * Appends a tyle of the step type to the track with its corresponding position.
     * @param {String} stepType 
     * @param {Vector2} position 
     */
    addStepBack(stepType, position) {
        console.assert(typeof stepType === "string");
        console.assert(position instanceof Vector2);
        let updateList = [];
        let updateTile = new Tile(0,0,0,1);
        if (stepType in stepColorMapping) {
            updateTile.color = stepColorMapping[stepType];
            updateTile.type = stepType;
        } else {
            console.error(`Step type of '${stepType}' does not exist!`);
        }
        updateList.push(updateTile);
        updateList.push(position);
        this.steps.push(updateList);
    }

    /**
     * Returns an array with the first element being the new tile and the second
     * element is the position of this new tile.
     * @returns {[Tile, Vector2]}
     */
    removeStepBack() {
        return this.steps.pop();
    }

    /**
     * Retrieves the number of steps in the track.
     * @returns {Integer}
     */
    getStepCount() {
        return this.steps.length;
    }

    /**
     * Returns the specified step.
     * @param {Integer} ind 
     * @returns {[Tile, Vector2]}
     */
    getStep(stepInd) {
        return this.steps[stepInd];
    }
}