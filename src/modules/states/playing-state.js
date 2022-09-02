import Screen from "../screen.js";
import Settings from "../settings.js";
import Grid from "../grid.js";
import StepTrack from "../step-track.js";
import Vector2 from "../vector2.js";
import PlaybackTrack from "../data-structures/playback-track.js";
import PlaybackUpdate from "../data-structures/playback-update.js";
import Tile from "../tile.js";
import Color3 from "../color3.js";

// algorithms
import Dijkstra from "../algorithms/dijkstra.js";
import A_Star from "../algorithms/a_star.js";

// constants
const STEPS_PER_SECOND = 2;

/*
    Notes for next steps:
     - Edit the implementation of StepTrack to allow for multiple updates per step
*/

export default class PlayingState {
    playButton = Screen.buttons.playButton;
    skipForwardButton = Screen.buttons.skipForwardButton;
    skipBackwardButton = Screen.buttons.skipBackwardButton;

    constructor() {
        this.currentStep = -1;
        this.playing = false;
        this.playbackTrack = null;
        this.playbackGrid = null;
    }

    canEnterState() {
        // Perform a check to see if the user can begin playback.
        return Screen.isGoalTilePlaced() && Screen.isStartingTilePlaced();
    }

    skipForward() {
        // if (-1 <= this.currentStep && this.currentStep + 1 < this.playbackTrack.getStepCount()) {
        //     this.currentStep++;
        //     let update = this.playbackTrack.getStep(this.currentStep);
        //     let updateTile = update[0];
        //     let updatePos = update[1];
        //     this.playbackGrid.setTileColor(updatePos.X, updatePos.Y, updateTile.color, updateTile.alpha);
        // }
        if (this.playbackTrack !== null) {
            this.playbackTrack.stepForward();
        }
    }

    skipBackward() {
        // if (0 <= this.currentStep && this.currentStep < this.playbackTrack.getStepCount()) {
        //     let updatePos = this.playbackTrack.getStep(this.currentStep)[1];
        //     this.playbackGrid.resetTileColor(updatePos.X, updatePos.Y);
        //     this.currentStep--;
        // }
        if (this.playbackTrack !== null) {
            this.playbackTrack.stepBackward();
        }
    }

    enter() {
        this.currentStep = -1;
        this.playButton.classList.add("active-button");
        if (this.playbackGrid === null) {
            this.playbackGrid = new Grid(Screen.CANVAS_SIZE.X, Screen.CANVAS_SIZE.Y); //
        }

        let centerTilePos = new Vector2(Screen.virtualCanvas.tileGrid.size.X, Screen.virtualCanvas.tileGrid.size.Y);
        centerTilePos.X = Math.floor(centerTilePos.X / 2);
        centerTilePos.Y = Math.floor(centerTilePos.Y / 2);

        // Create playback track
        let algorithmObj = null;
        switch(Settings.getAlgorithm()) {
            case "Dijkstra":
                algorithmObj = new Dijkstra(Screen.virtualCanvas);
                break;
            case "A*":
                algorithmObj = new A_Star(Screen.virtualCanvas);
                break;
            default:
                console.error("Invalid algorithm");
        }
        
        this.playbackTrack = algorithmObj.createPlaybackTrack();

        // If step mode, enable step buttons
        this.playbackTrack.setGrid(this.playbackGrid);
        if (Settings.getPlaybackMode() === "Step") {
            this.skipForwardButton.classList.remove("disabled-button");
            this.skipBackwardButton.classList.remove("disabled-button");
            this.skipForwardButton.onclick = () => {
                this.skipForward();
            }
            this.skipBackwardButton.onclick = () => {
                this.skipBackward();
            };
        } else if (Settings.getPlaybackMode() === "Auto") {
            this.playbackTrack.play();
        }
        // Change playbutton icon
        this.playing = true;
        // console.log("entered playing state");
    }

    exit() {
        // Empty the playback grid
        if (this.playbackGrid !== null) {
            const size = this.playbackGrid.tileGrid.size.scale(1); // create a copy
            for (let r = 0; r < size.Y; ++r) {
                for (let c = 0; c < size.X; ++c) {
                    this.playbackGrid.resetTileColor(c, r);
                }
            }
        }
        // Remove playback track
        this.playbackTrack.stop();
        this.playbackTrack = null;
        // Change the play button icon back to the play icon
        // Disable the step buttons
        if (Settings.getPlaybackMode() === "Step") {
            this.skipForwardButton.classList.add("disabled-button");
            this.skipBackwardButton.classList.add("disabled-button");
            this.skipBackwardButton.onclick = null;
            this.skipForwardButton.onclick = null;
        }
        
        this.playButton.classList.remove("active-button");
        this.playing = false;
        // console.log("exited playing state");
    }

    handleButtonInput(button, actionType) {
        if (actionType !== "click") return;

        if (button === this.playButton) {
            if (this.playing) {
                this.exit();
            } else {
                this.enter();
            }
        } else if (Screen.isToolbarButton(button)) {
            this.exit();
        }
    }

    handleMouseInput(eventInfo, actionType) {}

    frameUpdate() {
        this.playbackGrid.drawTiles();
    }

    toString() {
        return "PlayingState";
    }
}