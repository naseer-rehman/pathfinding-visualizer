import Screen from "/modules/screen.js";
import Settings from "/modules/settings.js";
import Vector2 from "/modules/vector2.js";
import PlaybackUpdate from "/modules/data-structures/playback-update.js";

// Changes that need to be made:
// * For each update, I should keep track of the tile information
//   for each tile that is to be updated.
//   That way, if I step backward in playback, I can revert the changes properly rather
//   than just resetting the tile and making it blank again.

export default class PlaybackTrack {
    constructor() {
        this.updates = [];
        this.currentPos = -1;
        this.currentElapsedTime = 0;
        this.playbackInterval = null;
        this.grid = null;
        this.playing = false;
        this.finishedPlaying = false;
    }
    
    setGrid(grid) {
        this.grid = grid;
    }

    resetGrid() {
        this.setGrid(null);
    }

    playbackUpdate() {
        let appearingUpdate = this.updates[this.currentPos + 1];
        let tileUpdatesCount = appearingUpdate.getUpdateCount();
        let progressPercent = this.currentElapsedTime / appearingUpdate.getAnimationTime();
        appearingUpdate.drawUpdate(this.grid, progressPercent);
        this.currentElapsedTime += Screen.FRAME_TIMING * Settings.getPlaybackSpeed();
        if (progressPercent > 1) {
            this.currentElapsedTime = 0;
            ++this.currentPos;
            if (this.currentPos + 1 >= this.updates.length) {
                clearInterval(this.playbackInterval);
                appearingUpdate.drawUpdate(this.grid, 1); // fully draw this update
                this.finishedPlaying = true;
                this.playing = false;
            }
        }
    }

    play() {
        if (this.grid === null) return;

        this.playing = true;
        this.currentPos = -1;
        this.currentElapsedTime = 0;
        if (this.updates.length == 0) {
            console.warn("There are 0 updates in this track! What are you even playing?!");
        }
        console.log("began playback");
        this.playbackInterval = setInterval(() => {
            this.playbackUpdate()
        }, Screen.FRAME_TIMING);
    }

    stop() {
        clearInterval(this.playbackInterval);
        this.playbackInterval = null;
        this.playing = false;
        this.resetGrid();
    }

    pushUpdate(update) {
        console.assert(update instanceof PlaybackUpdate);
        this.updates.push(update);
    }

    stepForward() {
        // for step playback mode
        if (this.grid === null || this.currentPos + 1 >= this.updates.length) return;
        
        let currentUpdate = this.updates[this.currentPos + 1];
        while (currentUpdate && !currentUpdate.isEndOfStep()) {
            console.log("drew an update in while loop");
            currentUpdate.drawUpdate(this.grid, 1);
            this.currentPos++;
            currentUpdate = this.updates[this.currentPos + 1];
        }
        if (currentUpdate) {
            console.log("drew the end of step update");
            currentUpdate.drawUpdate(this.grid, 1);
            this.currentPos++;
        }
    }

    stepBackward() {
        // for step playback mode
        if (this.grid === null || this.currentPos < 0) return;

        let currentUpdate = this.updates[this.currentPos];
        do {
            currentUpdate.resetUpdate(this.grid);
            this.currentPos--;
            currentUpdate = this.updates[this.currentPos];
        } while (currentUpdate && !currentUpdate.isEndOfStep());
        console.log(this.currentPos);
    }
}
