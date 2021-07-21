import Screen from "/modules/screen.js";
import Color3 from "/modules/color3.js";
import Grid from "/modules/grid.js";
import Vector2 from "/modules/vector2.js";

const TILE_COLOR = new Color3(17, 17, 128);
const TILE_ALPHA = 0.5;
const FLASH_TIME = 1200; // milliseconds
const TARGET_ALPHA_VALUE = 0.2;
const DELTA_ALPHA_PER_UPDATE = TARGET_ALPHA_VALUE / FLASH_TIME * Screen.FRAME_TIMING; // alpha value delta per frame

export default class PlacingWallsState {
    wallButton = Screen.buttons.wallButton;
    isPlacingWalls = false;

    constructor() {
        this.currentAlphaValue = TARGET_ALPHA_VALUE;
        this.alphaChangeDirection = 1;
        this.hoverColor = new Color3(80,80,255);
        this.getCurrentHoverCSS = () => {
            return `rgba(${this.hoverColor.R},${this.hoverColor.G},${this.hoverColor.B},${this.alphaValue})`;
        }
    }

    exit() {
        this.wallButton.classList.remove("active-button");
        this.isPlacingWalls = false;
    }

    enter() {
        this.currentAlphaValue = TARGET_ALPHA_VALUE;
        this.alphaChangeDirection = 1;
        this.wallButton.classList.add("active-button");
        this.isPlacingWalls = true;
    }

    handleButtonInput(button, actionType) {
        if (actionType !== "click") return;
        if (button === this.wallButton) {
            if (this.isPlacingWalls) {
                this.exit();
            } else {
                this.enter();
            }
        } else if (Screen.isToolbarButton(button)) {
            this.exit();
        }
    }

    handleMouseInput(eventInfo, actionType) {
        let mousePos = new Vector2(eventInfo.clientX, eventInfo.clientY);
        let hoveringElement = document.elementFromPoint(mousePos.X, mousePos.Y);
        let virtualCanvas = Screen.virtualCanvas;
        let canvas = Screen.canvas;
        if (Screen.isElementDescendantOf(hoveringElement, Screen.mainToolbar)) return;

        if (actionType === "mousedown") {
            if (virtualCanvas.isScreenCoordinatesOnGrid(mousePos)) {
                let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(mousePos);
                let hoverTile = virtualCanvas.getTile(hoverTilePos.X, hoverTilePos.Y);
                if (eventInfo.button == 0) { // Left mouse button
                    if (hoverTile.type === "blank") {
                        virtualCanvas.setTileColor(hoverTilePos.X, hoverTilePos.Y, TILE_COLOR, TILE_ALPHA);
                        hoverTile.type = "wall";
                    }
                } else if (eventInfo.button == 2) { // Right mouse button
                    if (hoverTile.type === "wall") {
                        virtualCanvas.resetTileColor(hoverTilePos.X, hoverTilePos.Y);
                        hoverTile.type = "blank";
                    }
                }
                // previousTilePos = hoverTilePos;
            }
        } else if (actionType === "mousemove" && virtualCanvas.isScreenCoordinatesOnGrid(mousePos)) {
            let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(mousePos);
            let hoverTile = virtualCanvas.getTile(hoverTilePos.X, hoverTilePos.Y);
            if (Screen.isHoldingLMB && hoverTile.type === "blank") {
                hoverTile.type = "wall";
                virtualCanvas.setTileColor(hoverTilePos.X, hoverTilePos.Y, TILE_COLOR, TILE_ALPHA);
            } else if (Screen.isHoldingRMB && hoverTile.type === "wall" && !(Screen.isHoldingLMB)) {
                hoverTile.type = "blank";
                virtualCanvas.resetTileColor(hoverTilePos.X, hoverTilePos.Y);
            }
        }
    }

    frameUpdate() {
        let virtualCanvas = Screen.virtualCanvas;
        let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(Screen.currentMousePosition);
        let hoverTile = virtualCanvas.getTile(hoverTilePos.X, hoverTilePos.Y);
        let topLeftCorner = virtualCanvas.getScreenCoordinateFromTileCoordinate(hoverTilePos);
        if (hoverTile.type === "blank") {
            this.currentAlphaValue += this.alphaChangeDirection * DELTA_ALPHA_PER_UPDATE;
            if (this.currentAlphaValue >= TARGET_ALPHA_VALUE) {
                this.currentAlphaValue = TARGET_ALPHA_VALUE;
                this.alphaChangeDirection = -1;
            } else if (this.currentAlphaValue <= 0) {
                this.currentAlphaValue = 0;
                this.alphaChangeDirection = 1;
            }
            Screen.ctx.fillStyle = `rgba(${TILE_COLOR.R},${TILE_COLOR.G},${TILE_COLOR.B},${this.currentAlphaValue})`;
            Screen.ctx.fillRect(topLeftCorner.X + 2, topLeftCorner.Y + 2, Screen.TILE_SIZE - 4, Screen.TILE_SIZE - 4);
        }
    }

    toString() {
        return "PlacingWallsState";
    }
}