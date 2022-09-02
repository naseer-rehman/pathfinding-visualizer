import Tile from "../tile.js";
import Vector2  from "../vector2.js";

export default class PlaybackUpdate {
    constructor() {
        // 2-D array containing pairs of [Tile, Vector2]
        this.tileUpdates = [];
        this.animationTime = 0; // in milliseconds
        this.endOfStep = false;
    }

    /**
     * Appends the two-element array containing the new tile information 
     * and tile position to this playback update.
     * @param {[Tile, Vector2]]} tileUpdate 
     */
    pushTileUpdate(tileUpdate) {
        console.assert(tileUpdate.length == 2);
        console.assert(tileUpdate[0] instanceof Tile);
        console.assert(tileUpdate[1] instanceof Vector2);
        this.tileUpdates.push(tileUpdate);
    }

    /**
     * Sets the provided number as the time it will take to fully draw 
     * all the tiles in this update.
     * @param {Number} value 
     */
    setAnimationTime(value) {
        this.animationTime = value;
    }

    getAnimationTime() {
        return this.animationTime;
    }

    getTileUpdate(index) {
        return this.tileUpdates[index];
    }

    getUpdateCount() {
        return this.tileUpdates.length;
    }

    setEndOfStep(isStepEnd) {
        this.endOfStep = isStepEnd;
    }

    isEndOfStep() {
        return this.endOfStep;
    }

    drawUpdate(grid, progressPercent) {
        for (let i = 0; i < this.tileUpdates.length; ++i) {
            const tileUpdate = this.getTileUpdate(i);
            const newTile = tileUpdate[0];
            const newTilePos = tileUpdate[1];
            let animationAlpha = newTile.alpha * progressPercent;
            grid.setTileColor(newTilePos.X, newTilePos.Y, newTile.color, animationAlpha);
        }
    }

    resetUpdate(grid) {
        for (let i = 0; i < this.tileUpdates.length; ++i) {
            const tileUpdate = this.getTileUpdate(i);
            const newTilePos = tileUpdate[1];
            grid.resetTileColor(newTilePos.X, newTilePos.Y);
        }
    }
}