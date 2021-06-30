import Tile from "/modules/tile.js";
import Vector2  from "/modules/vector2.js";

export default class PlaybackUpdate {
    constructor() {
        // 2-D array containing pairs of [Tile, Vector2]
        this.tileUpdates = [];
        this.animationTime = 0;
        this.stepEnd = false;
    }

    /**
     * Appends the two-element array containing the new tile information and tile position
     * to this playback update.
     * @param {[Tile, Vector2]]} tileUpdate 
     */
    pushTileUpdate(tileUpdate) {
        console.assert(tileUpdate.length == 2);
        console.assert(tileUpdate[0] instanceof Tile);
        console.assert(tileUpdate[1] instanceof Vector2);
        this.tileUpdates.push(tileUpdate);
    }
    
    getUpdate(index) {
        return this.tileUpdates[index];
    }

    getUpdateCount() {
        return this.tileUpdates.length;
    }
}