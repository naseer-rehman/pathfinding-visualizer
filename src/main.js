// This is a program that draws graphics for a path-finding visualizer, made by Naseer Rehman.
// Very hard to make, for me.
import "./main.css";
import Loader from "./modules/loader.js";
import Color3 from "./modules/color3.js";
import Vector2 from "./modules/vector2.js";
import Screen from "./modules/screen.js";
import Grid from "./modules/grid.js";
import UserState from "./modules/user-state.js";
import Settings from "./modules/settings.js";
import NotificationService from "./modules/notification-service.js";
import MarkerPNG from "./images/marker-PNG.png";
import TargetPNG from "./images/target-PNG.png";
import WeightPNG from "./images/weight-PNG.png";

await Loader.waitUntilLoad();

const canvas = document.getElementById("canvas");
Screen.canvas = canvas;
Screen.ctx = canvas.getContext('2d');
let width = canvas.offsetWidth;
let height = canvas.offsetHeight;
canvas.width = width;
canvas.height = height;

// Images
let startingTileIcon = new Image();
let goalTileIcon = new Image();
let weightTileIcon = new Image();

startingTileIcon.src = MarkerPNG;
goalTileIcon.src = TargetPNG;
weightTileIcon.src = WeightPNG;

// CONSTANTS VARIABLES
const DEFAULT_WEIGHT = 15; // Default weight for a weight tile.
Screen.width = width;
Screen.height = height;
Screen.TILE_SIZE = 48;
Screen.TIME_SIZE_WITH_BORDER = Screen.TILE_SIZE + 2;
Screen.ICON_SIZE = 30;
Screen.ICON_CORNER_OFFSET = Math.floor((Screen.TILE_SIZE - Screen.ICON_SIZE) / 2);
Screen.CANVAS_SIZE = new Vector2(width, height).scale(1.5);
Screen.MAX_OFFSET = new Vector2((Screen.CANVAS_SIZE.getX() - width) / 2, (Screen.CANVAS_SIZE.getY() - height) / 2);
Screen.startingTilePosition = new Vector2(-1, -1);
Screen.goalTilePosition = new Vector2(-1, -1);
Screen.centerOffset = new Vector2(0, 0);
Screen.currentMousePosition = new Vector2(-width, -height);
Screen.SCREEN_CENTER = new Vector2(Math.floor(width / 2), 
                                  Math.floor(height / 2));
Screen.isMouseInViewport = false;
const virtualCanvas = new Grid(Screen.CANVAS_SIZE.X, Screen.CANVAS_SIZE.Y);
Screen.virtualCanvas = virtualCanvas;
const userState = new UserState();

// VARIABLES
let currentUserState = "idle";
    // states: idle, placingStartingTile, placingGoalTile, 
    //         erasingTiles, editingSettings, viewingInfo, 
    //         stepping, autoPlaying, placingWallTiles,
    //         placingWeightTiles


// FUNCTIONS
function changeUserState(state) {
    currentUserState = state;
}


function getUserState() {
    return currentUserState;
}


function isUserState(state) {
    return getUserState() === state;
}


let mouseEventFunctions = {};
mouseEventFunctions.resetPreviousStartTile = () => {
    if (virtualCanvas.isTileCoordinatesOnGrid(Screen.startingTilePosition.X, Screen.startingTilePosition.Y)) {
        console.log("resetting previous start tile");
        virtualCanvas.resetTileColor(Screen.startingTilePosition.X, Screen.startingTilePosition.Y);
        let previousStartTile = virtualCanvas.getTile(Screen.startingTilePosition.X, Screen.startingTilePosition.Y);
        previousStartTile.removeIcon();
        previousStartTile.type = "blank";
        Screen.startingTilePosition.X = -1;
        Screen.startingTilePosition.Y = -1;
    } else {
        console.log("attempted start tile reset: failed tho");
    }
}

mouseEventFunctions.resetPreviousGoalTile = () => {
    if (virtualCanvas.isTileCoordinatesOnGrid(Screen.goalTilePosition.X, Screen.goalTilePosition.Y)) {
        virtualCanvas.resetTileColor(Screen.goalTilePosition.X, Screen.goalTilePosition.Y);
        let previousStartTile = virtualCanvas.getTile(Screen.goalTilePosition.X, Screen.goalTilePosition.Y);
        previousStartTile.removeIcon();
        previousStartTile.type = "blank";
        Screen.goalTilePosition.X = -1;
        Screen.goalTilePosition.Y = -1;
    }
}

mouseEventFunctions.canPlaceOnTile = (x, y) => {
    return virtualCanvas.isTileCoordinatesOnGrid(x, y) && virtualCanvas.getTile(x, y).type === "blank";
}

mouseEventFunctions.hasPressedLMB = (e) => {
    return e.button == LEFT_MOUSE_BUTTON;
}

mouseEventFunctions.hasPressedRMB = (e) => {
    return e.button == RIGHT_MOUSE_BUTTON;
}

mouseEventFunctions.hasPressedMMB = (e) => {
    return e.button == MIDDLE_MOUSE_BUTTON;
}

const LEFT_MOUSE_BUTTON = 0;
const MIDDLE_MOUSE_BUTTON = 1;
const RIGHT_MOUSE_BUTTON = 2;
const WALL_COLOR = new Color3(80,80,255);
const WALL_ALPHA = 0.5;
let isHoldingLMB = false;
let isHoldingRMB = false;
let previousTilePos = null;

function connectMouseEvents() {
    let isTranslating = false;
    let originalMousePosition = new Vector2();
    let lastMousePosition = new Vector2();

    document.onmousedown = (e) => {
        if (mouseEventFunctions.hasPressedLMB(e)) {
            isHoldingLMB = true;
            Screen.isHoldingLMB = true;
        } else if (mouseEventFunctions.hasPressedRMB(e)) {
            isHoldingRMB = true;
            Screen.isHoldingRMB = true;
        }
        userState.handleMouseInput(e, "mousedown");
        let mousePos = new Vector2(e.clientX, e.clientY);
        let hoveringElement = document.elementFromPoint(mousePos.X, mousePos.Y);
        if (mouseEventFunctions.hasPressedMMB(e) && !isTranslating) {
            isTranslating = true;
            document.body.style.cursor = "grabbing";
            originalMousePosition = new Vector2(e.clientX, e.clientY);
            lastMousePosition = new Vector2(e.clientX, e.clientY);
        }
    }

    document.onmouseup = (e) => {
        if (mouseEventFunctions.hasPressedLMB(e)) {
            isHoldingLMB = false;
            Screen.isHoldingLMB = false;
        } else if (mouseEventFunctions.hasPressedRMB(e)) {
            isHoldingRMB = false;
            Screen.isHoldingRMB = false;
        }
        if (mouseEventFunctions.hasPressedMMB(e) && isTranslating) {
            isTranslating = false;
            document.body.style.cursor = "default";
        }
        userState.handleMouseInput(e, "mouseup");
    }

    document.onmousemove = (e) => {
        Screen.currentMousePosition.X = e.clientX;
        Screen.currentMousePosition.Y = e.clientY;
        let mousePos = new Vector2(e.clientX, e.clientY);
        let hoveringElement = document.elementFromPoint(e.clientX, e.clientY);
        if (isTranslating) {
            let newMousePosition = new Vector2(e.clientX, e.clientY);
            let delta = newMousePosition.sub(lastMousePosition);
            if (Math.abs(Screen.centerOffset.X) <= Screen.MAX_OFFSET.X) {
                let newX = Screen.centerOffset.X + delta.X;
                newX = Math.sign(newX) * Math.min(Math.abs(newX), Screen.MAX_OFFSET.X);
                Screen.centerOffset.X = newX;
            }
            if (Math.abs(Screen.centerOffset.Y) <= Screen.MAX_OFFSET.Y) {
                let newY = Screen.centerOffset.Y + delta.Y;
                newY = Math.sign(newY) * Math.min(Math.abs(newY), Screen.MAX_OFFSET.Y);
                Screen.centerOffset.Y = newY;
            }
            lastMousePosition = newMousePosition;
        }
        userState.handleMouseInput(e, "mousemove");
    }

    document.onmouseenter = (event) => {
        Screen.isMouseInViewport = true;
    }

    document.onmouseleave = (event) => {
        Screen.isMouseInViewport = false;
    }
}



const FLASH_TIME = 1200; // milliseconds
const TARGET_ALPHA_VALUE = 0.2;
const DELTA_ALPHA_PER_UPDATE = TARGET_ALPHA_VALUE / FLASH_TIME * Screen.FRAME_TIMING; // alpha value delta per frame
// const TILE_HOVER_COLOR = new Color3(0,0,0);
let currentAlphaValue = TARGET_ALPHA_VALUE;
let alphaChangeDirection = 1;
let isStateWithHoverAnim = () => {
    return isUserState("idle") || isUserState("placingStartingTile") || isUserState("placingWeightTiles")
    || isUserState("placingGoalTile") || isUserState("placingWallTiles");
}

function frameUpdate() {
    Screen.ctx.clearRect(0, 0, width, height);
    virtualCanvas.draw();
    userState.frameUpdate();
    Screen.drawGridToCenterVector();
    Screen.drawCenterReference();
}


function main() {
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Toolbar Opener Functionality
    let toolbarOpener = document.getElementById("toolbarOpener");
    let mainToolbar = document.getElementById("mainToolbar");
    let toolbarOpen = false;
    toolbarOpener.onclick = () => {
        if (!toolbarOpen) {
            mainToolbar.classList.add("closed");
            toolbarOpener.children[0].classList.add("closed");
            toolbarOpen = true;
        } else {
            mainToolbar.classList.remove("closed");
            toolbarOpener.children[0].classList.remove("closed");
            toolbarOpen = false;
        }
    };

    // Button functionality
    let playButton = document.getElementById("playButton");
    let speedScaleButton = document.getElementById("speedScaleButton");
    let skipBackwardButton = document.getElementById("skipBackwardButton");
    let skipForwardButton = document.getElementById("skipForwardButton");
    let markerButton = document.getElementById("markerButton");
    let goalButton = document.getElementById("goalButton");
    let wallButton = document.getElementById("wallButton");
    let weightButton = document.getElementById("weightButton");
    let clearButton = document.getElementById("clearButton");
    let settingsButton = document.getElementById("settingsButton");
    let infoButton = document.getElementById("infoButton");

    let settingsWindow = document.getElementsByClassName("settings-prompt")[0];
    let settingsCloseButton = settingsWindow.querySelector(".close-prompt");

    let clearWindow = document.body.querySelector(".clear-prompt");
    let clearCloseButton = clearWindow.querySelector(".close-prompt");

    Screen.buttons.settingsButton.onclick = () => {
        if (userState.currentState === UserState.editingSettingsState) {
            // Currently viewing settings.
            userState.handleButtonInput(settingsButton, "click", UserState.idleState);
            settingsCloseButton.onclick = null;
        } else {
            // In another state.
            userState.handleButtonInput(settingsButton, "click", UserState.editingSettingsState);
            settingsCloseButton.onclick = () => {
                userState.handleButtonInput(settingsCloseButton, "click", UserState.idleState);
                settingsCloseButton.onclick = null;
            };
        }
    };

    Screen.buttons.clearButton.onclick = () => {
        if (userState.currentState === UserState.clearState) {
            userState.handleButtonInput(Screen.buttons.clearButton, "click", UserState.idleState);
            Screen.buttons.clearCloseButton.onclick = null;
            Screen.buttons.clearEverythingButton.onclick = null;
            Screen.buttons.clearWallsButton.onclick = null;
        } else {
            userState.handleButtonInput(Screen.buttons.clearButton, "click", UserState.clearState);
            Screen.buttons.clearCloseButton.onclick = () => {
                userState.handleButtonInput(Screen.buttons.clearCloseButton, "click", UserState.idleState);
            };
            Screen.buttons.clearEverythingButton.onclick = () => {
                userState.handleButtonInput(Screen.buttons.clearEverythingButton, "click", UserState.idleState);
            };
            Screen.buttons.clearWallsButton.onclick = () => {
                userState.handleButtonInput(Screen.buttons.clearWallsButton, "click", UserState.idleState);
            };
        }
    };

    Screen.buttons.markerButton.onclick = () => {
        if (userState.currentState === UserState.placingStartingTileState) {
            userState.handleButtonInput(Screen.buttons.markerButton, "click", UserState.idleState);
        } else {
            userState.handleButtonInput(Screen.buttons.markerButton, "click", UserState.placingStartingTileState);
        }
    }

    Screen.buttons.goalButton.onclick = () => {
        if (userState.currentState === UserState.placingGoalTileState) {
            userState.handleButtonInput(Screen.buttons.goalButton, "click", UserState.idleState);
        } else {
            userState.handleButtonInput(Screen.buttons.goalButton, "click", UserState.placingGoalTileState);
        }
    }

    Screen.buttons.wallButton.onclick = () => {
        if (userState.currentState === UserState.placingWallsState) {
            userState.handleButtonInput(Screen.buttons.wallButton, "click", UserState.idleState);
        } else {
            userState.handleButtonInput(Screen.buttons.wallButton, "click", UserState.placingWallsState);
        }
    }

    Screen.buttons.weightButton.onclick = () => {
        if (userState.currentState === UserState.placingWeightTilesState) {
            userState.handleButtonInput(Screen.buttons.weightButton, "click", UserState.idleState);
        } else {
            userState.handleButtonInput(Screen.buttons.weightButton, "click", UserState.placingWeightTilesState)
        }
    }

    Screen.buttons.speedScaleButton.onclick = () => {
        Settings.cyclePlaybackSpeed();
        let speedLabel = document.querySelector(".speed-scale-label");
        speedLabel.innerHTML = Settings.getPlaybackSpeedLabel();
    }

    Screen.buttons.playButton.onclick = () => {
        // Here is the logic for when the play button is clicked.
        if (userState.currentState === UserState.playingState) {
            console.log("entering idle state");
            userState.handleButtonInput(Screen.buttons.playButton, "click", UserState.idleState);
        } else if (UserState.playingState.canEnterState()) {
            console.log("entering the playing state i guess");
            userState.handleButtonInput(Screen.buttons.playButton, "click", UserState.playingState);
        } else {
            if (Screen.isGoalTilePlaced() == false) {
                NotificationService.addNotification("place the <span style='color:rgb(255,100,100);'>goal tile</span>...");
            }
            if (Screen.isStartingTilePlaced() == false) {
                NotificationService.addNotification("place the <span style='color:rgb(100,210,100);'>starting tile</span>...");
            }
        }
    }

    // Other functionality that's important af
    connectMouseEvents();
    setInterval(frameUpdate, Screen.FRAME_TIMING);

    NotificationService.addNotification("HELLO!!!");
}

main();