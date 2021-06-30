import Screen from "/modules/screen.js";
import Settings from "/modules/settings.js";
import Vector2 from "/modules/vector2.js";

export default class PlaybackTrack {
    constructor() {
        this.updates = [];
        this.currentPos = -1;
        this.playbackInterval = null;
    }

    

    playbackUpdate(grid) {
        
    }

    play(grid) {
        this.playbackInterval = setInterval(() => {
            this.playbackUpdate(grid)
        }, Screen.FRAME_TIMING);
    }

    stop() {
        clearInterval(this.playbackInterval);
        this.playbackInterval = null;
    }

    stepForward() {
        // for step playback mode
    }

    stepBackward() {
        // for step playback mode
    }
}
