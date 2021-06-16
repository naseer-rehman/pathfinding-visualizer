// This is a program that draws graphics for a path-finding visualizer, made by Naseer Rehman.
// Very hard to make, for me.

import Color3 from "./modules/color3.js";
import Vector2 from "./modules/vector2.js";
import Screen from "./modules/screen.js";
import Grid from "./modules/grid.js";
import UserState from "./modules/user-state.js";

const canvas = document.getElementById("canvas");
Screen.ctx = canvas.getContext('2d');
let width = canvas.offsetWidth;
let height = canvas.offsetHeight;
canvas.width = width;
canvas.height = height;

// Images
let startingTileIcon = new Image();
let goalTileIcon = new Image();
let weightTileIcon = new Image();

startingTileIcon.src = "images/marker-PNG.png";
goalTileIcon.src = "images/target-PNG.png";
weightTileIcon.src = "images/weight-PNG.png";

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


function disconnectMouseEvents() {
    document.onmousedown = null;
    document.onmouseup = null;
    document.onmousemove = null;
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
        } else if (mouseEventFunctions.hasPressedRMB(e)) {
            isHoldingRMB = true;
        }
        let mousePos = new Vector2(e.clientX, e.clientY);
        let hoveringElement = document.elementFromPoint(mousePos.X, mousePos.Y);
        if (mouseEventFunctions.hasPressedMMB(e) && !isTranslating) {
            isTranslating = true;
            document.body.style.cursor = "grabbing";
            originalMousePosition = new Vector2(e.clientX, e.clientY);
            lastMousePosition = new Vector2(e.clientX, e.clientY);
        } else if (isUserState("placingStartingTile")) {
            // let hoveringElement = document.elementFromPoint(e.clientX, e.clientY);
            if (hoveringElement === canvas) {
                let hoverTileCoordinate = virtualCanvas.getTileCoordinateFromScreenCoordinate(new Vector2(e.clientX, e.clientY));
                let hoverTile = virtualCanvas.getTile(hoverTileCoordinate.X, hoverTileCoordinate.Y);
                if (mouseEventFunctions.hasPressedLMB(e) 
                && mouseEventFunctions.canPlaceOnTile(hoverTileCoordinate.X, hoverTileCoordinate.Y)) {
                    mouseEventFunctions.resetPreviousStartTile();
                    Screen.startingTilePosition = hoverTileCoordinate;
                    virtualCanvas.setTileColor(Screen.startingTilePosition.X, Screen.startingTilePosition.Y, new Color3(100,255,100), 0.5);
                    hoverTile.setIcon(startingTileIcon);
                    hoverTile.type = "start";
                } else if (mouseEventFunctions.hasPressedRMB(e) 
                && hoverTileCoordinate.equals(Screen.startingTilePosition)) {
                    mouseEventFunctions.resetPreviousStartTile();
                    hoverTile.type = "blank";
                }
            }
        } else if (isUserState("placingGoalTile")) {
            // let hoveringElement = document.elementFromPoint(e.clientX, e.clientY);
            if (hoveringElement === canvas) {
                let hoverTileCoordinate = virtualCanvas.getTileCoordinateFromScreenCoordinate(new Vector2(e.clientX, e.clientY));
                let hoverTile = virtualCanvas.getTile(hoverTileCoordinate.X, hoverTileCoordinate.Y);
                if (mouseEventFunctions.hasPressedLMB(e) 
                && mouseEventFunctions.canPlaceOnTile(hoverTileCoordinate.X, hoverTileCoordinate.Y)) {
                    mouseEventFunctions.resetPreviousGoalTile();
                    Screen.goalTilePosition = hoverTileCoordinate;
                    virtualCanvas.setTileColor(Screen.goalTilePosition.X, Screen.goalTilePosition.Y, 
                        new Color3(255,100,100), 0.5);
                    hoverTile.setIcon(goalTileIcon);
                    hoverTile.type = "goal";
                } else if (mouseEventFunctions.hasPressedRMB(e) 
                && hoverTileCoordinate.equals(Screen.goalTilePosition)) {
                    mouseEventFunctions.resetPreviousGoalTile();
                    hoverTile.type = "blank";
                }
            }
        } else if (isUserState("placingWallTiles")) {
            if (hoveringElement === canvas && virtualCanvas.isScreenCoordinatesOnGrid(mousePos)) {
                let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(mousePos);
                let hoverTile = virtualCanvas.getTile(hoverTilePos.X, hoverTilePos.Y);
                if (mouseEventFunctions.hasPressedLMB(e)) {
                    if (mouseEventFunctions.canPlaceOnTile(hoverTilePos.X, hoverTilePos.Y)) {
                        virtualCanvas.setTileColor(hoverTilePos.X, hoverTilePos.Y, WALL_COLOR, WALL_ALPHA);
                        hoverTile.type = "wall";
                    }
                } else if (mouseEventFunctions.hasPressedRMB(e)) {
                    if (hoverTile.type === "wall") {
                        virtualCanvas.resetTileColor(hoverTilePos.X, hoverTilePos.Y);
                        hoverTile.type = "blank";
                    }
                }
                previousTilePos = hoverTilePos;
            }
        } else if (isUserState("placingWeightTiles")) {
            if (hoveringElement === canvas && virtualCanvas.isScreenCoordinatesOnGrid(mousePos)) {
                let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(mousePos);
                let hoverTile = virtualCanvas.getTile(hoverTilePos.X, hoverTilePos.Y);
                if (mouseEventFunctions.canPlaceOnTile(hoverTilePos.X, hoverTilePos.Y)
                && mouseEventFunctions.hasPressedLMB(e)) {
                    virtualCanvas.setTileColor(hoverTilePos.X, hoverTilePos.Y, WALL_COLOR, WALL_ALPHA);
                    hoverTile.type = "weight";
                    hoverTile.setIcon(weightTileIcon);    
                } else if (mouseEventFunctions.hasPressedRMB(e) && hoverTile.type === "weight") {
                    virtualCanvas.resetTileColor(hoverTilePos.X, hoverTilePos.Y);
                    hoverTile.type = "blank";
                    hoverTile.removeIcon();
                }
            }
        }
    }

    document.onmouseup = (e) => {
        if (mouseEventFunctions.hasPressedLMB(e)) {
            isHoldingLMB = false;
        } else if (mouseEventFunctions.hasPressedRMB(e)) {
            isHoldingRMB = false;
        }
        if (mouseEventFunctions.hasPressedMMB(e) && isTranslating) {
            isTranslating = false;
            document.body.style.cursor = "default";
        }
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
        if (isUserState("placingWallTiles") && hoveringElement === canvas
        && virtualCanvas.isScreenCoordinatesOnGrid(mousePos)) {
            let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(mousePos);
            let hoverTile = virtualCanvas.getTile(hoverTilePos.X, hoverTilePos.Y);
            if (!hoverTilePos.equals(previousTilePos)) {
                if (isHoldingLMB && mouseEventFunctions.canPlaceOnTile(hoverTilePos.X, hoverTilePos.Y)) {
                    hoverTile.type = "wall";
                    virtualCanvas.setTileColor(hoverTilePos.X, hoverTilePos.Y, 
                        WALL_COLOR, WALL_ALPHA);
                } else if (isHoldingRMB && hoverTile.type === "wall" && !(isHoldingLMB)) {
                    hoverTile.type = "blank";
                    virtualCanvas.resetTileColor(hoverTilePos.X, hoverTilePos.Y);
                }
                previousTilePos = hoverTilePos;
            }
        } else if (isUserState("placingWeightTiles") && hoveringElement === canvas 
        && virtualCanvas.isScreenCoordinatesOnGrid(mousePos)) {
            let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(mousePos);
            let hoverTile = virtualCanvas.getTile(hoverTilePos.X, hoverTilePos.Y);
            if (isHoldingLMB && mouseEventFunctions.canPlaceOnTile(hoverTilePos.X, hoverTilePos.Y)) {
                virtualCanvas.setTileColor(hoverTilePos.X, hoverTilePos.Y, WALL_COLOR, WALL_ALPHA);
                hoverTile.type = "weight";
                hoverTile.setIcon(weightTileIcon);
            } else if (isHoldingRMB && hoverTile.type === "weight") {
                virtualCanvas.resetTileColor(hoverTilePos.X, hoverTilePos.Y);
                hoverTile.type = "blank";
                hoverTile.removeIcon();
            }
        }
    }

    document.onmouseenter = (event) => {
        Screen.isMouseInViewport = true;
        console.log("entered the screen");
    }

    document.onmouseleave = (event) => {
        Screen.isMouseInViewport = false;
        console.log("left the screen");
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
    if (Screen.isMouseInViewport && isStateWithHoverAnim()) {
        let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(Screen.currentMousePosition);
        let topLeftCorner = virtualCanvas.getScreenCoordinateFromTileCoordinate(hoverTilePos);
        if (isUserState("idle") || mouseEventFunctions.canPlaceOnTile(hoverTilePos.X, hoverTilePos.Y)) {
            currentAlphaValue += alphaChangeDirection * DELTA_ALPHA_PER_UPDATE;
            if (currentAlphaValue >= TARGET_ALPHA_VALUE) {
                currentAlphaValue = TARGET_ALPHA_VALUE;
                alphaChangeDirection = -1;
            } else if (currentAlphaValue <= 0) {
                currentAlphaValue = 0;
                alphaChangeDirection = 1;
            }
            let fillColor = new Color3(0,0,0);
            let icon = null;
            switch(getUserState()) {
                case "idle":
                    fillColor.setRGB(100,100,100);
                    break;
                case "placingWallTiles":
                    fillColor.setRGB(WALL_COLOR.R, WALL_COLOR.G, WALL_COLOR.B);
                    break;
                case "placingWeightTiles":
                    fillColor.setRGB(WALL_COLOR.R, WALL_COLOR.G, WALL_COLOR.B);
                    icon = weightTileIcon;
                    break;
                case "placingStartingTile":
                    fillColor.setRGB(100,255,100);
                    icon = startingTileIcon;
                    break;
                case "placingGoalTile":
                    fillColor.setRGB(255,100,100);
                    icon = goalTileIcon;
                    break;
            }
            Screen.ctx.fillStyle = `rgba(${fillColor.R},${fillColor.G},${fillColor.B},${currentAlphaValue})`;
            Screen.ctx.fillRect(topLeftCorner.X + 2, topLeftCorner.Y + 2, Screen.TILE_SIZE - 4, Screen.TILE_SIZE - 4);
            if (icon !== null) {
                Screen.ctx.drawImage(icon, topLeftCorner.X + Screen.ICON_CORNER_OFFSET, topLeftCorner.Y + Screen.ICON_CORNER_OFFSET);
            }
        }
    }
    Screen.drawGridToCenterVector();
    Screen.drawCenterReference();
}



function main() {
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Local variables
    let settingValues = {algorithm : "dijsktra", playbackMode : "auto"};
    let speedSetting = {
        current : 1, // index of option
        speedLabels : ["0.5x", "1.0x", "1.5x", "2.0x"],
        speedValues : [0.5, 1.0, 1.5, 2.0]
    }

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

    let activeButtons = new Map(); // My sad attempt at controlling user states
    let totalActiveButtons = 0;
    activeButtons.set("settings", false);
    activeButtons.set("information", false);
    activeButtons.set("placeWalls", false);
    activeButtons.set("clearWalls", false);
    activeButtons.set("placeGoal", false);
    activeButtons.set("play", false);

    // onPromptButtonClick(closeButtonObject, activeButtonsKey, windowToOpen) will handle 
    //  the event associated with specified window's button, when it is clicked.
    let onPromptButtonClick = (buttonCloseObject, buttonKey, windowObject, onOpen, onClose) => {
        console.log(totalActiveButtons);
        if (activeButtons.get(buttonKey)) {
            totalActiveButtons--;
            activeButtons.set(buttonKey, false);
            windowObject.classList.add("hidden");
            if (onClose) {
                onClose();
            }
            buttonCloseObject.onclick = () => {};
        } else if (totalActiveButtons == 0) {
            totalActiveButtons++;
            activeButtons.set(buttonKey, true);
            windowObject.classList.remove("hidden");
            if (onOpen) {
                onOpen();
            }
            buttonCloseObject.onclick = () => {
                windowObject.classList.add("hidden");
                activeButtons.set(buttonKey, false);
                totalActiveButtons--;
                if (onClose) {
                    onClose();
                }
                buttonCloseObject.onclick = () => {};
            }
        }
    }

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

    markerButton.onclick = () => {
        if (isUserState("idle")) {
            changeUserState("placingStartingTile");
            markerButton.classList.add("active-button");
        } else if (isUserState("placingStartingTile")) {
            changeUserState("idle");
            markerButton.classList.remove("active-button");
        }
    }

    goalButton.onclick = () => {
        if (isUserState("idle")) {
            changeUserState("placingGoalTile");
            goalButton.classList.add("active-button");
        } else if (isUserState("placingGoalTile")) {
            changeUserState("idle");
            goalButton.classList.remove("active-button");
        }
    }

    wallButton.onclick = () => {
        if (isUserState("idle")) {
            changeUserState("placingWallTiles");
            wallButton.classList.add("active-button");
        } else if (isUserState("placingWallTiles")) {
            changeUserState("idle");
            wallButton.classList.remove("active-button");
        }
    }

    weightButton.onclick = () => {
        if (isUserState("idle")) {
            changeUserState("placingWeightTiles");
            weightButton.classList.add("active-button");
        } else if (isUserState("placingWeightTiles")) {
            changeUserState("idle");
            weightButton.classList.remove("active-button");
        }
    }

    speedScaleButton.onclick = () => {
        let speedLabel = document.querySelector(".speed-scale-label");
        speedSetting.current++;
        speedSetting.current = speedSetting.current % speedSetting.speedValues.length;
        speedLabel.innerHTML = speedSetting.speedLabels[speedSetting.current];
    }

    // Other functionality that's important as fuck
    connectMouseEvents();
    setInterval(frameUpdate, Screen.FRAME_TIMING);
}
main();