import Screen from "../screen.js";
import Color3 from "../color3.js";
import Grid from "../grid.js";
import Vector2 from "../vector2.js";
import MarkerPNG from "../../images/marker-PNG.png"

function resetPreviousStartTile() {
    let virtualCanvas = Screen.virtualCanvas;
    let pos = Screen.startingTilePosition;
    if (virtualCanvas.isTileCoordinatesOnGrid(pos.X, pos.Y)) {
        virtualCanvas.resetTileColor(pos.X, pos.Y);
        let previousStartTile = virtualCanvas.getTile(pos.X, pos.Y);
        previousStartTile.removeIcon();
        previousStartTile.type = "blank";
        Screen.startingTilePosition.X = -1;
        Screen.startingTilePosition.Y = -1;
    }
}

const TILE_COLOR = new Color3(100,255,100);
const TILE_ALPHA = 0.5;
const FLASH_TIME = 1200; // milliseconds
const TARGET_ALPHA_VALUE = 0.2;
const DELTA_ALPHA_PER_UPDATE = TARGET_ALPHA_VALUE / FLASH_TIME * Screen.FRAME_TIMING; // alpha value delta per frame

export default class PlacingStartingTileState {
    markerButton = Screen.buttons.markerButton;
    placingTiles = false;
    constructor() {
        this.startingTileIcon = new Image();
        this.startingTileIcon.src = MarkerPNG;
        this.currentAlphaValue = TARGET_ALPHA_VALUE;
        this.alphaChangeDirection = 1;
    }

    enter() {
        this.markerButton.classList.add("active-button");
        this.currentAlphaValue = TARGET_ALPHA_VALUE;
        this.alphaChangeDirection = 1;
        this.placingTiles = true;
    }
    
    exit() {
        this.markerButton.classList.remove("active-button");
        this.placingTiles = false;
    }

    handleButtonInput(button, actionType) {
        if (actionType !== "click") return;

        if (button === this.markerButton) {
            if (this.placingTiles) {
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
        if (Screen.isElementDescendantOf(hoveringElement, Screen.mainToolbar)) 
            return;
            
        if (actionType === "mousedown") {
            let hoverTileCoordinate = virtualCanvas.getTileCoordinateFromScreenCoordinate(mousePos);
            let hoverTile = virtualCanvas.getTile(hoverTileCoordinate.X, hoverTileCoordinate.Y);
            if (eventInfo.button == 0 && hoverTile.type === "blank") {
                resetPreviousStartTile();
                Screen.startingTilePosition = hoverTileCoordinate;
                virtualCanvas.setTileColor(hoverTileCoordinate.X, hoverTileCoordinate.Y, TILE_COLOR, TILE_ALPHA);
                hoverTile.setIcon(this.startingTileIcon);
                hoverTile.type = "start";
            } else if (eventInfo.button == 2 && hoverTileCoordinate.equals(Screen.startingTilePosition)) {
                resetPreviousStartTile();
                hoverTile.type = "blank";
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
            let oldGlobalAlpha = Screen.ctx.globalAlpha;
            Screen.ctx.globalAlpha = this.currentAlphaValue;
            Screen.ctx.drawImage(this.startingTileIcon, topLeftCorner.X + Screen.ICON_CORNER_OFFSET, topLeftCorner.Y + Screen.ICON_CORNER_OFFSET);
            Screen.ctx.globalAlpha = oldGlobalAlpha;
        }
    }

    toString() {
        return "PlacingStartingTileState";
    }
}