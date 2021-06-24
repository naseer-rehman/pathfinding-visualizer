import Screen from "/modules/screen.js";
import Vector2 from "/modules/vector2.js";
import Color3 from "/modules/color3.js";

function resetPreviousGoalTile() {
    if (Screen.virtualCanvas.isTileCoordinatesOnGrid(Screen.goalTilePosition.X, Screen.goalTilePosition.Y)) {
        Screen.virtualCanvas.resetTileColor(Screen.goalTilePosition.X, Screen.goalTilePosition.Y);
        let previousGoalTile = Screen.virtualCanvas.getTile(Screen.goalTilePosition.X, Screen.goalTilePosition.Y);
        previousGoalTile.removeIcon();
        previousGoalTile.type = "blank";
        Screen.goalTilePosition.X = -1;
        Screen.goalTilePosition.Y = -1;
    }
}

const TILE_COLOR = new Color3(255,100,100);
const TILE_ALPHA = 0.5;
const FLASH_TIME = 1200; // milliseconds
const TARGET_ALPHA_VALUE = 0.2;
const DELTA_ALPHA_PER_UPDATE = TARGET_ALPHA_VALUE / FLASH_TIME * Screen.FRAME_TIMING; // alpha value delta per frame

export default class PlacingGoalTileState {
    isPlacingGoalTile = false;
    goalButton = Screen.buttons.goalButton;

    constructor() {
        this.currentAlphaValue = TARGET_ALPHA_VALUE;
        this.alphaChangeDirection = 1;
        this.goalTileIcon = new Image();
        this.goalTileIcon.src = "images/target-PNG.png";
    }

    enter() {
        this.currentAlphaValue = TARGET_ALPHA_VALUE;
        this.alphaChangeDirection = 1;
        this.goalButton.classList.add("active-button");
        this.isPlacingGoalTile = true;
    }
    
    exit() {
        this.goalButton.classList.remove("active-button");
        this.isPlacingGoalTile = false;
    }

    handleButtonInput(button, actionType) {
        if (actionType !== "click") return;
        if (button === this.goalButton) {
            if (this.isPlacingGoalTile) {
                this.exit();
            } else {
                this.enter();
            }
        } else if (Screen.isToolbarButton(button)) {
            this.exit();
        }
    }

    handleMouseInput(eventInfo, actionType) {
        if (actionType === "mousedown") {
            let hoveringElement = document.elementFromPoint(eventInfo.clientX, eventInfo.clientY);
            let virtualCanvas = Screen.virtualCanvas;
            if (Screen.isElementDescendantOf(hoveringElement, Screen.mainToolbar)) 
            return;
            let hoverTileCoordinate = virtualCanvas.getTileCoordinateFromScreenCoordinate(new Vector2(eventInfo.clientX, eventInfo.clientY));
            let hoverTile = virtualCanvas.getTile(hoverTileCoordinate.X, hoverTileCoordinate.Y);
            if (eventInfo.button == 0 && hoverTile.type === "blank") {
                resetPreviousGoalTile();
                Screen.goalTilePosition = hoverTileCoordinate;
                virtualCanvas.setTileColor(Screen.goalTilePosition.X, Screen.goalTilePosition.Y, 
                    TILE_COLOR, TILE_ALPHA);
                hoverTile.setIcon(this.goalTileIcon);
                hoverTile.type = "goal";
            } else if (eventInfo.button == 2 && hoverTileCoordinate.equals(Screen.goalTilePosition)) {
                resetPreviousGoalTile();
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
            Screen.ctx.drawImage(this.goalTileIcon, topLeftCorner.X + Screen.ICON_CORNER_OFFSET, topLeftCorner.Y + Screen.ICON_CORNER_OFFSET);
            Screen.ctx.globalAlpha = oldGlobalAlpha;
        }
    }
}