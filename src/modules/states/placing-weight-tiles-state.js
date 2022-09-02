import Screen from "../screen.js";
import Vector2 from "../vector2.js";
import Color3 from "../color3.js";
import WeightPNG from "../../images/weight-PNG.png";

let TILE_COLOR = new Color3(80,80,80);
let TILE_ALPHA = 0.1;
const FLASH_TIME = 1200; // milliseconds
const TARGET_ALPHA_VALUE = TILE_ALPHA;
const DELTA_ALPHA_PER_UPDATE = TARGET_ALPHA_VALUE / FLASH_TIME * Screen.FRAME_TIMING; // alpha value delta per frame

export default class PlacingWeightTilesState {
    isPlacingTiles = false;
    weightButton = Screen.buttons.weightButton;
    constructor() {
        this.currentAlphaValue = TARGET_ALPHA_VALUE;
        this.alphaChangeDirection = 1;
        this.weightTileIcon = new Image();
        this.weightTileIcon.src = WeightPNG;
    }

    enter() {
        this.currentAlphaValue = TARGET_ALPHA_VALUE;
        this.alphaChangeDirection = 1;
        this.weightButton.classList.add("active-button");
        this.isPlacingTiles = true;
    }
    exit() {
        this.weightButton.classList.remove("active-button");
        this.isPlacingTiles = false;
    }
    handleButtonInput(button, actionType) {
        if (actionType !== "click") return;
        if (button === this.weightButton) {
            if (this.isPlacingTiles) {
                this.exit();
            } else {
                this.enter();
            }
        } else if (Screen.isToolbarButton(button)) {
            this.exit();
        }
    }

    handleMouseInput(eventInfo, actionType) {
        let hoveringElement = document.elementFromPoint(eventInfo.clientX, eventInfo.clientY);
        let virtualCanvas = Screen.virtualCanvas;
        let mousePos = new Vector2(eventInfo.clientX, eventInfo.clientY);

        if (Screen.isElementDescendantOf(hoveringElement, Screen.mainToolbar)) 
            return;

        if (actionType === "mousedown") {
            if (virtualCanvas.isScreenCoordinatesOnGrid(mousePos)) {
                let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(mousePos);
                let hoverTile = virtualCanvas.getTile(hoverTilePos.X, hoverTilePos.Y);
                if (eventInfo.button == 0 && hoverTile.type === "blank") { // Left button
                    virtualCanvas.setTileColor(hoverTilePos.X, hoverTilePos.Y, TILE_COLOR, TILE_ALPHA);
                    hoverTile.type = "weight";
                    hoverTile.setIcon(this.weightTileIcon);    
                } else if (eventInfo.button == 2 && hoverTile.type === "weight") { // Right button
                    virtualCanvas.resetTileColor(hoverTilePos.X, hoverTilePos.Y);
                    hoverTile.type = "blank";
                    hoverTile.removeIcon();
                }
            }
        } else if (actionType === "mousemove") {
            if (virtualCanvas.isScreenCoordinatesOnGrid(mousePos)) {
                let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(mousePos);
                let hoverTile = virtualCanvas.getTile(hoverTilePos.X, hoverTilePos.Y);
                if (Screen.isHoldingLMB && hoverTile.type === "blank") {
                    virtualCanvas.setTileColor(hoverTilePos.X, hoverTilePos.Y, TILE_COLOR, TILE_ALPHA);
                    hoverTile.type = "weight";
                    hoverTile.setIcon(this.weightTileIcon);
                } else if (Screen.isHoldingRMB && !Screen.isHoldingLMB 
                           && hoverTile.type === "weight") {
                    virtualCanvas.resetTileColor(hoverTilePos.X, hoverTilePos.Y);
                    hoverTile.type = "blank";
                    hoverTile.removeIcon();
                }
            }
        }
    }

    frameUpdate() {
        let virtualCanvas = Screen.virtualCanvas;
        let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(Screen.currentMousePosition);
        let hoverTile = virtualCanvas.getTile(hoverTilePos.X, hoverTilePos.Y);
        if (hoverTile === null) return;
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
            let oldGlobalAlpha = Screen.ctx.globalAlpha;
            Screen.ctx.globalAlpha = this.currentAlphaValue;
            Screen.ctx.drawImage(this.weightTileIcon, topLeftCorner.X + Screen.ICON_CORNER_OFFSET, topLeftCorner.Y + Screen.ICON_CORNER_OFFSET);
            Screen.ctx.globalAlpha = oldGlobalAlpha;
        }
    }

    toString() {
        return "PlacingWeightTileState";
    }
}