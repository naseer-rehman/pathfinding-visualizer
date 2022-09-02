import Loader from "./loader.js";
import Color3 from "./color3.js";
import Vector2 from "./vector2.js";
import Tile from "./tile.js";
import Screen from "./screen.js";

await Loader.waitUntilLoad();

// Constants
const GRID_BORDER_COLOR = getComputedStyle(document.body).getPropertyValue("--grid-background");
const GRID_LINE_COLOR = getComputedStyle(document.body).getPropertyValue("--grid-line-color");
console.log("Loaded grid colors:", GRID_BORDER_COLOR, GRID_LINE_COLOR);

export default class Grid {
    topLeftCorner = new Vector2();
    topRightCorner = new Vector2();
    bottomLeftCorner = new Vector2();
    bottomRightCorner = new Vector2();

    calcTopLeftCorner(offset) {
        console.assert(offset instanceof Vector2);
        this.topLeftCorner.X = Screen.SCREEN_CENTER.X + Math.floor(offset.X) - (this.tileGrid.size.X * (Screen.TILE_SIZE + 1)) / 2;
        this.topLeftCorner.Y = Screen.SCREEN_CENTER.Y + Math.floor(offset.Y) - (this.tileGrid.size.Y * (Screen.TILE_SIZE + 1)) / 2;
    }

    calcCorners(offset) {
        console.assert(offset instanceof Vector2);
        this.calcTopLeftCorner(offset);
        let relativeCenter = Screen.SCREEN_CENTER.add(offset);
        relativeCenter.X = Math.floor(relativeCenter.X);
        relativeCenter.Y = Math.floor(relativeCenter.Y);
        this.topRightCorner.X = relativeCenter.X + (this.tileGrid.size.X * (Screen.TILE_SIZE + 1)) / 2;
        this.topRightCorner.Y = relativeCenter.Y - (this.tileGrid.size.Y * (Screen.TILE_SIZE + 1)) / 2;
        this.bottomRightCorner.X = relativeCenter.X + (this.tileGrid.size.X * (Screen.TILE_SIZE + 1)) / 2;
        this.bottomRightCorner.Y = relativeCenter.Y + (this.tileGrid.size.Y * (Screen.TILE_SIZE + 1)) / 2;
        this.bottomLeftCorner.X = relativeCenter.X - (this.tileGrid.size.X * (Screen.TILE_SIZE + 1)) / 2;
        this.bottomLeftCorner.Y = relativeCenter.Y + (this.tileGrid.size.Y * (Screen.TILE_SIZE + 1)) / 2;
    }

    /**
     * Given a tile coordinate (as a Vector2), the function will return screen coordinate
     * of the top-left pixel of the specified tile, taking the center-offset into consideration.
     * @param {Vector2} tileCoordinate 
     * @returns {Vector2}
     */
    getScreenCoordinateFromTileCoordinate(tileCoordinate) {
        console.assert(tileCoordinate instanceof Vector2);
        this.calcTopLeftCorner(Screen.centerOffset);
        let calculatedCoordinate = new Vector2();
        calculatedCoordinate.X = this.topLeftCorner.X + 1 + tileCoordinate.X * (Screen.TILE_SIZE + 1);
        calculatedCoordinate.Y = this.topLeftCorner.Y + 1 + tileCoordinate.Y * (Screen.TILE_SIZE + 1);
        return calculatedCoordinate;
    }

    /**
     * Given a screen coordinate, the function will return the tile that the screen coordinate resides on.
     * @param {Vector2} screenCoordinate 
     * @returns {Vector2}
     */
    getTileCoordinateFromScreenCoordinate(screenCoordinate) {
        console.assert(screenCoordinate instanceof Vector2);
        this.calcTopLeftCorner(Screen.centerOffset);
        let tileCoordinate = new Vector2();
        tileCoordinate.X = Math.floor((screenCoordinate.X - this.topLeftCorner.X) / (Screen.TILE_SIZE + 1));
        tileCoordinate.Y = Math.floor((screenCoordinate.Y - this.topLeftCorner.Y) / (Screen.TILE_SIZE + 1));
        return tileCoordinate;
    }


    constructor(canvasSizeX, canvasSizeY) {
        this.canvas = {};
        this.canvas.size = new Vector2(canvasSizeX, canvasSizeY);
        // Now calculate the tiles that can fit in this canvas
        let leftOverX = (this.canvas.size.getX() - 1) % (2 * Screen.TILE_SIZE + 2);
        let leftOverY = (this.canvas.size.getY() - 1) % (2 * Screen.TILE_SIZE + 2);
        this.tileGrid = {}
        this.tileGrid.size = new Vector2();
        this.tileGrid.size.setX((this.canvas.size.getX() - 1 - leftOverX) / (Screen.TILE_SIZE + 1));
        this.tileGrid.size.setY((this.canvas.size.getY() - 1 - leftOverY) / (Screen.TILE_SIZE + 1));
        console.log(`Tile Grid Size: (${this.tileGrid.size.X}, ${this.tileGrid.size.Y})`);

        this.tileGrid.grid = [];
        for (let r = 0; r < this.tileGrid.size.Y; ++r) {
            this.tileGrid.grid[r] = [];
            for (let c = 0; c < this.tileGrid.size.X; ++c) {
                this.tileGrid.grid[r][c] = new Tile(0,0,0,0);
            }
        }

        this.wallGrid = [];
        for (let r = 0; r < this.tileGrid.size.Y; ++r) {
            this.wallGrid[r] = [];
            
        }
    }

    /**
     * Checks if the tile coordinates are valid coordinates on the tile grid.
     * @param {Int} x 
     * @param {Int} y 
     * @returns {Boolean}
     */
    isTileCoordinatesOnGrid(x, y) {
        return (0 <= x && x < this.tileGrid.size.X) && (0 <= y && y < this.tileGrid.size.y);
    }

    /**
     * Checks if the screen coordinates is on the displayed tile grid.
     * @param {Vector2} pos 
     * @returns {Boolean}
     */
    isScreenCoordinatesOnGrid(pos) {
        let hoverTilePos = this.getTileCoordinateFromScreenCoordinate(pos);
        return this.isTileCoordinatesOnGrid(hoverTilePos.X, hoverTilePos.Y);
    }

    /**
     * Obtains the tile at the position (x, y) on the tile grid.
     * @param {Int} x 
     * @param {Int} y 
     * @returns {Tile}
     */
    getTile(x, y) {
        console.assert(this.isTileCoordinatesOnGrid(x, y));
        return this.tileGrid.grid[y][x];
    }

    /**
     * Set the color of the tile at position (x, y)
     * @param {Number} x 
     * @param {Number} y 
     * @param {Color3} color 
     * @param {Number} alpha 
     */
    setTileColor(x, y, color, alpha) {
        console.assert(this.isTileCoordinatesOnGrid(x, y));
        console.assert(color instanceof Color3);
        let tile = this.getTile(x, y);
        tile.color = color;
        tile.alpha = alpha;
    }

    resetTileColor(x, y) {
        this.setTileColor(x, y, new Color3(0,0,0), 0);
    }

    resetAllTiles() {
        Screen.goalTilePosition.X = Screen.startingTilePosition.X = -1;
        Screen.goalTilePosition.Y = Screen.startingTilePosition.Y = -1;
        for (let r = 0; r < this.tileGrid.size.Y; ++r) {
            for (let c = 0; c < this.tileGrid.size.X; ++c) {
                let tile = this.tileGrid.grid[r][c];
                tile.type = "blank";
                if (tile.hasIcon) {
                    tile.removeIcon();
                }
                this.resetTileColor(c, r);
            }
        }
    }

    resetWallTilesOnly() {
        for (let r = 0; r < this.tileGrid.size.Y; ++r) {
            for (let c = 0; c < this.tileGrid.size.X; ++c) {
                let tile = this.tileGrid.grid[r][c];
                if (tile.type === "wall" || tile.type === "weight") {
                    tile.type = "blank";
                    if (tile.hasIcon) {
                        tile.removeIcon();
                    }
                    this.resetTileColor(c, r);
                }
            }
        }
    }

    drawGridLines() {
        let centerCrossSize = 20;
        let centerLineX = Screen.SCREEN_CENTER.x + Math.floor(Screen.centerOffset.x) + 0.5;
        let centerLineY = Screen.SCREEN_CENTER.y + Math.floor(Screen.centerOffset.y) + 0.5;
    
        Screen.ctx.lineWidth = 1;
        Screen.ctx.strokeStyle = GRID_LINE_COLOR;
        Screen.ctx.beginPath();
        Screen.ctx.moveTo(centerLineX, 0);
        Screen.ctx.lineTo(centerLineX, Screen.height);
        Screen.ctx.moveTo(0, centerLineY);
        Screen.ctx.lineTo(Screen.width, centerLineY);
        for (let x = centerLineX + Screen.TILE_SIZE + 1; x < Screen.width; x += (Screen.TILE_SIZE + 1)) {
            Screen.ctx.moveTo(x, 0);
            Screen.ctx.lineTo(x, Screen.height);
        }
        for (let x = centerLineX - Screen.TILE_SIZE - 1; x >= 0; x -= (Screen.TILE_SIZE + 1)) {
            Screen.ctx.moveTo(x, 0);
            Screen.ctx.lineTo(x, Screen.height);
        }
        for (let y = centerLineY + Screen.TILE_SIZE + 1; y < Screen.height; y += (Screen.TILE_SIZE + 1)) {
            Screen.ctx.moveTo(0, y);
            Screen.ctx.lineTo(Screen.width, y);
        }
        for (let y = centerLineY - Screen.TILE_SIZE - 1; y >= 0; y -= (Screen.TILE_SIZE + 1)) {
            Screen.ctx.moveTo(0, y);
            Screen.ctx.lineTo(Screen.width, y);
        }
        Screen.ctx.stroke();
    
        Screen.ctx.strokeStyle = "#F68F8F";
        Screen.ctx.beginPath();
        Screen.ctx.moveTo(centerLineX - Screen.TILE_SIZE, centerLineY);
        Screen.ctx.lineTo(centerLineX + Screen.TILE_SIZE, centerLineY);
        Screen.ctx.moveTo(centerLineX, centerLineY - Screen.TILE_SIZE);
        Screen.ctx.lineTo(centerLineX, centerLineY + Screen.TILE_SIZE);
        Screen.ctx.stroke();
        Screen.ctx.closePath();
    }

    drawBorder() {
        Screen.ctx.fillStyle = GRID_BORDER_COLOR;
        this.calcCorners(Screen.centerOffset);
        let leftSideDistance = this.topLeftCorner.X;
        let rightSideDistance = this.bottomRightCorner.X + 1;
        let topSideDistance = this.topLeftCorner.Y;
        let bottomSideDistance = this.bottomRightCorner.Y + 1;
        if (leftSideDistance > 0) {
            Screen.ctx.fillRect(0, 0, leftSideDistance, Screen.height);
        } else if (rightSideDistance < Screen.width) {
            Screen.ctx.fillRect(rightSideDistance, 0, Screen.width - rightSideDistance, Screen.height);
        }
        if (topSideDistance > 0) {
            Screen.ctx.fillRect(0, 0, Screen.width, topSideDistance);
        } else if (bottomSideDistance < Screen.height) {
            Screen.ctx.fillRect(0, bottomSideDistance, Screen.width, Screen.height - bottomSideDistance);
        }
    }
    
    drawTiles() {
        let topLeftTile = this.getTileCoordinateFromScreenCoordinate(new Vector2(0,0));
        let bottomRightTile = this.getTileCoordinateFromScreenCoordinate(new Vector2(Screen.width, Screen.height));
        let rowStart = Math.max(topLeftTile.Y, 0);
        let rowEnd = Math.min(bottomRightTile.Y, this.tileGrid.size.Y - 1);
        let columnStart = Math.max(topLeftTile.X, 0);
        let columnEnd = Math.min(bottomRightTile.X, this.tileGrid.size.X - 1);
        for (let r = rowStart; r <= rowEnd; ++r) {
            for (let c = columnStart; c <= columnEnd; ++c) {
                let currentTile = this.tileGrid.grid[r][c];
                let tilePos = this.getScreenCoordinateFromTileCoordinate(new Vector2(c, r));
                Screen.ctx.fillStyle = currentTile.CSSColor;
                Screen.ctx.fillRect(tilePos.X + 2, tilePos.Y + 2, Screen.TILE_SIZE - 4, Screen.TILE_SIZE - 4);
                if (currentTile.hasIcon()) {
                    Screen.ctx.drawImage(currentTile.getIcon(), tilePos.X + Screen.ICON_CORNER_OFFSET, tilePos.Y + Screen.ICON_CORNER_OFFSET);
                }
            }
        }
    }

    draw() {
        this.drawGridLines();
        this.drawTiles();
        this.drawBorder();
    }
}