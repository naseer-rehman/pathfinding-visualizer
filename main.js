// This is a program that draws graphics for a path-finding visualizer, made by Naseer Rehman.
// Very hard to make, for me.

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
let width = canvas.offsetWidth;
let height = canvas.offsetHeight;
canvas.width = width;
canvas.height = height;

// CONSTANTS VARIABLES
const GRID_BORDER_COLOR = getComputedStyle(document.body).getPropertyValue("--grid-background");
const GRID_LINE_COLOR = getComputedStyle(document.body).getPropertyValue("--grid-line-color");
const TILE_SIZE = 48; // Dimensions of the square grid tile.
const TILE_SIZE_WITH_BORDER = 50;
const FPS = 60 // frames
const FRAME_TIMING = 1000 / FPS;
const DEFAULT_WEIGHT = 15; // Default weight for a weight tile.
// const CANVAS_SIZE - The virtual canvas size
// const MAX_OFFSET - The max center offset 


// VARIABLES
let centerOffset;
let currentMousePosition;
let isMouseInViewport;
let startingTilePosition;
let goalTilePosition;
let currentUserState = "idle";
    // states: idle, placingStartingTile, placingGoalTile, 
    //         erasingTiles, editingSettings, viewingInfo, 
    //         stepping, autoPlaying, placingWallTiles,
    //         placingWeightTiles
// const SCREEN_CENTER - The screen coordinate of its center

// Images
const ICON_SIZE = 30;
const ICON_CORNER_OFFSET = Math.floor((TILE_SIZE - ICON_SIZE) / 2)
let startingTileIcon = new Image();
let goalTileIcon = new Image();
let weightTileIcon = new Image();

startingTileIcon.src = "images/marker-PNG.png";
goalTileIcon.src = "images/target-PNG.png";
weightTileIcon.src = "images/weight-PNG.png";


// CLASSES

class Color3 {
    constructor(r, g, b) {
        this._r = r;
        this._g = g;
        this._b = b;
    }
    get R() { return this._r; }
    get G() { return this._g; }
    get B() { return this._b; }
    set R(r) { this._r = r; }
    set G(g) { this._g = g; }
    set B(b) { this._b = b; } 
    setRGB(r, g, b) {
        this.R = r;
        this.G = g;
        this.B = b;
    }
}

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        return this;
    }

    add(vector2) {
        console.assert(vector2 instanceof Vector2);
        return new Vector2(this.x + vector2.x, this.y + vector2.y);
    }

    sub(vector2) {
        console.assert(vector2 instanceof Vector2);
        return new Vector2(this.x - vector2.x, this.y - vector2.y);
    }

    scale(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    dist(vector2) {
        console.assert(vector2 instanceof Vector2);
        let delta = vector2.sub(this);
        return Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    }

    equals(vector2) {
        if (!(vector2 instanceof Vector2)) {
            return false;
        }
        return this.x == vector2.x && this.y == vector2.y;
    }

    get X() { return this.x; }
    get Y() { return this.y; }
    set X(x) { this.x = x; }
    set Y(y) { this.y = y; }

    getX() { return this.x; }
    getY() { return this.y; }
    setX(x) { this.x = x; }
    setY(y) { this.y = y; }
}

const CANVAS_SIZE = new Vector2(width, height).scale(1.5);
const MAX_OFFSET = new Vector2((CANVAS_SIZE.getX() - width) / 2, (CANVAS_SIZE.getY() - height) / 2);
startingTilePosition = new Vector2(-1, -1);
goalTilePosition = new Vector2(-1, -1);
centerOffset = new Vector2(0, 0);
currentMousePosition = new Vector2(-width, -height);
const SCREEN_CENTER = new Vector2(Math.floor(width / 2), 
                                  Math.floor(height / 2));

class Tile {
    calculateCSSColor() {
        this._CSSColor = `rgba(${this.color.R},${this.color.G},${this.color.B},${this._alpha})`;
        // console.log(this._CSSColor);
    }

    constructor(r, g, b, a) {
        this._color = new Color3(r, g, b);
        this._alpha = a; // a = 1 is fully visible, a = 0 is invisible.
        this.calculateCSSColor();
        this._hasIcon = false;
        this._icon = null;
        this._type = "blank"; // Tile types: blank, wall, start, goal, weight
    }

    set color(c) { 
        // console.log(c instanceof Color3);
        this._color = c;
        this.calculateCSSColor();
    }

    get color() {
        return this._color;
    }

    set alpha(a) {
        // console.log(`Setting alpha to: ${a}`);
        this._alpha = a;
        this.calculateCSSColor();
    }

    get alpha() {
        return this._alpha;
    }

    get CSSColor() {
        return this._CSSColor;
    }

    set type(t) {
        this._type = t;
    }

    get type() {
        return this._type;
    }

    hasIcon() {
        return this._hasIcon;
    }

    setIcon(img) {
        console.assert(img instanceof Image);
        this._hasIcon = true;
        this._icon = img;
    }

    getIcon() {
        return this._icon;
    }

    removeIcon() {
        this._hasIcon = false;
        this._icon = null;
    }
}

class Grid {
    topLeftCorner = new Vector2();
    topRightCorner = new Vector2();
    bottomLeftCorner = new Vector2();
    bottomRightCorner = new Vector2();

    calcTopLeftCorner(offset) {
        console.assert(offset instanceof Vector2);
        this.topLeftCorner.X = SCREEN_CENTER.X + Math.floor(offset.X) - (this.tileGrid.size.X * (TILE_SIZE + 1)) / 2;
        this.topLeftCorner.Y = SCREEN_CENTER.Y + Math.floor(offset.Y) - (this.tileGrid.size.Y * (TILE_SIZE + 1)) / 2;
    }

    calcCorners(offset) {
        console.assert(offset instanceof Vector2);
        this.calcTopLeftCorner(offset);
        let relativeCenter = SCREEN_CENTER.add(offset);
        relativeCenter.X = Math.floor(relativeCenter.X);
        relativeCenter.Y = Math.floor(relativeCenter.Y);
        this.topRightCorner.X = relativeCenter.X + (this.tileGrid.size.X * (TILE_SIZE + 1)) / 2;
        this.topRightCorner.Y = relativeCenter.Y - (this.tileGrid.size.Y * (TILE_SIZE + 1)) / 2;
        this.bottomRightCorner.X = relativeCenter.X + (this.tileGrid.size.X * (TILE_SIZE + 1)) / 2;
        this.bottomRightCorner.Y = relativeCenter.Y + (this.tileGrid.size.Y * (TILE_SIZE + 1)) / 2;
        this.bottomLeftCorner.X = relativeCenter.X - (this.tileGrid.size.X * (TILE_SIZE + 1)) / 2;
        this.bottomLeftCorner.Y = relativeCenter.Y + (this.tileGrid.size.Y * (TILE_SIZE + 1)) / 2;
    }

    /**
     * Given a tile coordinate (as a Vector2), the function will return screen coordinate
     * of the top-left pixel of the specified tile, taking the center-offset into consideration.
     * @param {Vector2} tileCoordinate 
     * @returns {Vector2}
     */
    getScreenCoordinateFromTileCoordinate(tileCoordinate) {
        console.assert(tileCoordinate instanceof Vector2);
        this.calcTopLeftCorner(centerOffset);
        let calculatedCoordinate = new Vector2();
        calculatedCoordinate.X = this.topLeftCorner.X + 1 + tileCoordinate.X * (TILE_SIZE + 1);
        calculatedCoordinate.Y = this.topLeftCorner.Y + 1 + tileCoordinate.Y * (TILE_SIZE + 1);
        return calculatedCoordinate;
    }

    /**
     * Given a screen coordainte, the function will return the tile that the screen coordinate resides on.
     * @param {Vector2} screenCoordinate 
     * @returns {Vector2}
     */
    getTileCoordinateFromScreenCoordinate(screenCoordinate) {
        console.assert(screenCoordinate instanceof Vector2);
        this.calcTopLeftCorner(centerOffset);
        let tileCoordinate = new Vector2();
        tileCoordinate.X = Math.floor((screenCoordinate.X - this.topLeftCorner.X) / (TILE_SIZE + 1));
        tileCoordinate.Y = Math.floor((screenCoordinate.Y - this.topLeftCorner.Y) / (TILE_SIZE + 1));
        return tileCoordinate;
    }

    constructor(canvasSizeX, canvasSizeY) {
        this.canvas = {};
        this.canvas.size = new Vector2(canvasSizeX, canvasSizeY);
        // Now calculate the tiles that can fit in this canvas
        let leftOverX = (this.canvas.size.getX() - 1) % (2 * TILE_SIZE + 2);
        let leftOverY = (this.canvas.size.getY() - 1) % (2 * TILE_SIZE + 2);
        this.tileGrid = {}
        this.tileGrid.size = new Vector2();
        this.tileGrid.size.setX((this.canvas.size.getX() - 1 - leftOverX) / (TILE_SIZE + 1));
        this.tileGrid.size.setY((this.canvas.size.getY() - 1 - leftOverY) / (TILE_SIZE + 1));
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
        goalTilePosition.X = startingTilePosition.X = -1;
        goalTilePosition.Y = startingTilePosition.Y = -1;
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
        let centerLineX = SCREEN_CENTER.x + Math.floor(centerOffset.x) + 0.5;
        let centerLineY = SCREEN_CENTER.y + Math.floor(centerOffset.y) + 0.5;
    
        ctx.lineWidth = 1;
        ctx.strokeStyle = GRID_LINE_COLOR;
        ctx.beginPath();
        ctx.moveTo(centerLineX, 0);
        ctx.lineTo(centerLineX, height);
        ctx.moveTo(0, centerLineY);
        ctx.lineTo(width, centerLineY);
        for (let x = centerLineX + TILE_SIZE + 1; x < width; x += (TILE_SIZE + 1)) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        for (let x = centerLineX - TILE_SIZE - 1; x >= 0; x -= (TILE_SIZE + 1)) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        for (let y = centerLineY + TILE_SIZE + 1; y < height; y += (TILE_SIZE + 1)) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        for (let y = centerLineY - TILE_SIZE - 1; y >= 0; y -= (TILE_SIZE + 1)) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();
    
        ctx.strokeStyle = "#F68F8F";
        ctx.beginPath();
        ctx.moveTo(centerLineX - TILE_SIZE, centerLineY);
        ctx.lineTo(centerLineX + TILE_SIZE, centerLineY);
        ctx.moveTo(centerLineX, centerLineY - TILE_SIZE);
        ctx.lineTo(centerLineX, centerLineY + TILE_SIZE);
        ctx.stroke();
        ctx.closePath();
    }

    drawBorder() {
        ctx.fillStyle = GRID_BORDER_COLOR;
        this.calcCorners(centerOffset);
        let leftSideDistance = this.topLeftCorner.X;
        let rightSideDistance = this.bottomRightCorner.X + 1;
        let topSideDistance = this.topLeftCorner.Y;
        let bottomSideDistance = this.bottomRightCorner.Y + 1;
        if (leftSideDistance > 0) {
            ctx.fillRect(0, 0, leftSideDistance, height);
        } else if (rightSideDistance < width) {
            ctx.fillRect(rightSideDistance, 0, width - rightSideDistance, height);
        }
        if (topSideDistance > 0) {
            ctx.fillRect(0, 0, width, topSideDistance);
        } else if (bottomSideDistance < height) {
            ctx.fillRect(0, bottomSideDistance, width, height - bottomSideDistance);
        }
    }

    drawTiles() {
        let topLeftTile = this.getTileCoordinateFromScreenCoordinate(new Vector2(0,0));
        let bottomRightTile = this.getTileCoordinateFromScreenCoordinate(new Vector2(width, height));
        let rowStart = Math.max(topLeftTile.Y, 0);
        let rowEnd = Math.min(bottomRightTile.Y, this.tileGrid.size.Y - 1);
        let columnStart = Math.max(topLeftTile.X, 0);
        let columnEnd = Math.min(bottomRightTile.X, this.tileGrid.size.X - 1);
        for (let r = rowStart; r <= rowEnd; ++r) {
            for (let c = columnStart; c <= columnEnd; ++c) {
                let currentTile = this.tileGrid.grid[r][c];
                let tilePos = this.getScreenCoordinateFromTileCoordinate(new Vector2(c, r));
                ctx.fillStyle = currentTile.CSSColor;
                ctx.fillRect(tilePos.X + 2, tilePos.Y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                if (currentTile.hasIcon()) {
                    ctx.drawImage(currentTile.getIcon(), tilePos.X + ICON_CORNER_OFFSET, tilePos.Y + ICON_CORNER_OFFSET);
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

// MORE CONSTANTS
const virtualCanvas = new Grid(CANVAS_SIZE.X, CANVAS_SIZE.Y);

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


function drawCenterReference() {
    ctx.strokeStyle = "#A57400";
    ctx.beginPath();
    ctx.moveTo(SCREEN_CENTER.getX() - 10, SCREEN_CENTER.getY());
    ctx.lineTo(SCREEN_CENTER.getX() + 10, SCREEN_CENTER.getY());
    ctx.moveTo(SCREEN_CENTER.getX(), SCREEN_CENTER.getY() - 10);
    ctx.lineTo(SCREEN_CENTER.getX(), SCREEN_CENTER.getY() + 10);
    ctx.stroke();
    ctx.closePath();
}


function drawGridToCenterVector() {
    ctx.strokeStyle = "#00B029";
    ctx.beginPath();
    ctx.moveTo(SCREEN_CENTER.getX(), SCREEN_CENTER.getY());
    ctx.lineTo(SCREEN_CENTER.getX() + centerOffset.getX(), SCREEN_CENTER.getY() + centerOffset.getY());
    ctx.stroke();
    ctx.closePath();
}


function disconnectMouseEvents() {
    document.onmousedown = null;
    document.onmouseup = null;
    document.onmousemove = null;
}


let mouseEventFunctions = {};
mouseEventFunctions.resetPreviousStartTile = () => {
    if (virtualCanvas.isTileCoordinatesOnGrid(startingTilePosition.X, startingTilePosition.Y)) {
        console.log("resetting previous start tile");
        virtualCanvas.resetTileColor(startingTilePosition.X, startingTilePosition.Y);
        let previousStartTile = virtualCanvas.getTile(startingTilePosition.X, startingTilePosition.Y);
        previousStartTile.removeIcon();
        previousStartTile.type = "blank";
        startingTilePosition.X = -1;
        startingTilePosition.Y = -1;
    } else {
        console.log("attempted start tile reset: failed tho");
    }
}

mouseEventFunctions.resetPreviousGoalTile = () => {
    if (virtualCanvas.isTileCoordinatesOnGrid(goalTilePosition.X, goalTilePosition.Y)) {
        virtualCanvas.resetTileColor(goalTilePosition.X, goalTilePosition.Y);
        let previousStartTile = virtualCanvas.getTile(goalTilePosition.X, goalTilePosition.Y);
        previousStartTile.removeIcon();
        previousStartTile.type = "blank";
        goalTilePosition.X = -1;
        goalTilePosition.Y = -1;
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
console.log(WALL_COLOR._r, WALL_COLOR._g, WALL_COLOR._b);
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
                    startingTilePosition = hoverTileCoordinate;
                    virtualCanvas.setTileColor(startingTilePosition.X, startingTilePosition.Y, new Color3(100,255,100), 0.5);
                    hoverTile.setIcon(startingTileIcon);
                    hoverTile.type = "start";
                } else if (mouseEventFunctions.hasPressedRMB(e) 
                && hoverTileCoordinate.equals(startingTilePosition)) {
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
                    goalTilePosition = hoverTileCoordinate;
                    virtualCanvas.setTileColor(goalTilePosition.X, goalTilePosition.Y, 
                        new Color3(255,100,100), 0.5);
                    hoverTile.setIcon(goalTileIcon);
                    hoverTile.type = "goal";
                } else if (mouseEventFunctions.hasPressedRMB(e) 
                && hoverTileCoordinate.equals(goalTilePosition)) {
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
        currentMousePosition.X = e.clientX;
        currentMousePosition.Y = e.clientY;
        let mousePos = new Vector2(e.clientX, e.clientY);
        let hoveringElement = document.elementFromPoint(e.clientX, e.clientY);
        if (isTranslating) {
            let newMousePosition = new Vector2(e.clientX, e.clientY);
            let delta = newMousePosition.sub(lastMousePosition);
            if (Math.abs(centerOffset.X) <= MAX_OFFSET.X) {
                let newX = centerOffset.X + delta.X;
                newX = Math.sign(newX) * Math.min(Math.abs(newX), MAX_OFFSET.X);
                centerOffset.X = newX;
            }
            if (Math.abs(centerOffset.Y) <= MAX_OFFSET.Y) {
                let newY = centerOffset.Y + delta.Y;
                newY = Math.sign(newY) * Math.min(Math.abs(newY), MAX_OFFSET.Y);
                centerOffset.Y = newY;
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
                previosTilePos = hoverTilePos;
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
        isMouseInViewport = true;
        console.log("entered the screen");
    }

    document.onmouseleave = (event) => {
        isMouseInViewport = false;
        console.log("left the screen");
    }
}



const FLASH_TIME = 1200; // milliseconds
const TARGET_ALPHA_VALUE = 0.2;
const DELTA_ALPHA_PER_UPDATE = TARGET_ALPHA_VALUE / FLASH_TIME * FRAME_TIMING; // alpha value delta per frame
// const TILE_HOVER_COLOR = new Color3(0,0,0);
let currentAlphaValue = TARGET_ALPHA_VALUE;
let alphaChangeDirection = 1;
let isStateWithHoverAnim = () => {
    return isUserState("idle") || isUserState("placingStartingTile") || isUserState("placingWeightTiles")
    || isUserState("placingGoalTile") || isUserState("placingWallTiles");
}
function frameUpdate() {
    ctx.clearRect(0, 0, width, height);
    virtualCanvas.draw();
    if (isMouseInViewport && isStateWithHoverAnim()) {
        let hoverTilePos = virtualCanvas.getTileCoordinateFromScreenCoordinate(currentMousePosition);
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
            ctx.fillStyle = `rgba(${fillColor.R},${fillColor.G},${fillColor.B},${currentAlphaValue})`;
            ctx.fillRect(topLeftCorner.X + 2, topLeftCorner.Y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            if (icon !== null) {
                ctx.drawImage(icon, topLeftCorner.X + ICON_CORNER_OFFSET, topLeftCorner.Y + ICON_CORNER_OFFSET);
            }
        }
    }
    drawGridToCenterVector();
    drawCenterReference();
}



function main() {
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Local variables needed
    let settingValues = {algorithm : "dijsktra", playbackMode : "auto"};
    let speedSetting = {
        current : 1, // index of option
        speedLabels : ["0.5x", "1.0x", "1.5x", "2.0x"],
        speedValues : [0.5, 1, 1.5, 2.0]
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

    settingsButton.onclick = () => {
        let isDropdownOpen = false;
        let currentOpenDropdown = null;
        let onOpen = () => {
            let dropdowns = settingsWindow.querySelectorAll(".dropdown");
            for (let i = 0; i < dropdowns.length; ++i) {
                let dropdown = dropdowns[i];
                let dropdownSettingValue = dropdown.dataset.setting;
                let dropdownButton = dropdown.querySelector("div.active-dropdown-background");
                let dropdownLabel = dropdown.querySelector("div.active-dropdown-value");
                let dropdownOptionsContainer = dropdowns[i].querySelector("div.dropdown-options-container");
                let dropdownOptions = dropdownOptionsContainer.querySelectorAll(".dropdown-option");
                dropdownButton.onclick = () => {
                    if (isDropdownOpen == false && currentOpenDropdown === null) {
                        isDropdownOpen = true;
                        currentOpenDropdown = dropdownSettingValue;
                        let optionClicked = false;
                        dropdownOptionsContainer.classList.remove("hidden");
                        for (let i = 0; i < dropdownOptions.length; ++i) {
                            let option = dropdownOptions[i];
                            option.onclick = () => {
                                if (optionClicked == false) {
                                    let currentOptionValue = option.dataset.value;
                                    optionClicked = true;
                                    option.onclick = () => {};
                                    dropdownOptionsContainer.classList.add("hidden");
                                    dropdownLabel.innerHTML = currentOptionValue;
                                    settingValues[dropdownSettingValue] = currentOptionValue;
                                    currentOpenDropdown = null;
                                    isDropdownOpen = false;
                                    optionClicked = false;
                                }
                            };
                        }
                    } else if (isDropdownOpen == true && dropdownSettingValue === currentOpenDropdown) {
                        for (let i = 0; i < dropdownOptions.length; ++i) {
                            dropdownOptions[i].onclick = () => {};
                        }
                        dropdownOptionsContainer.classList.add("hidden");
                        isDropdownOpen = false;
                        currentOpenDropdown = null;
                    }
                };
            }
        };
        let onClose = () => {
            if (isDropdownOpen && currentOpenDropdown !== null) {
                let dropdown = settingsWindow.querySelector(`.dropdown[data-setting=${currentOpenDropdown}]`);
                let dropdownOptionsContainer = dropdown.querySelector("div.dropdown-options-container");
                let dropdownOptions = dropdownOptionsContainer.querySelectorAll("div.dropdown-option");
                for (let i = 0; i < dropdownOptions.length; ++i) {
                    dropdownOptions[i].onclick = () => {};
                }
                dropdownOptionsContainer.classList.add("hidden");
                isDropdownOpen = false;
                currentOpenDropdown = null;
            }
        }
        onPromptButtonClick(settingsCloseButton, "settings", settingsWindow, onOpen, onClose);
    };

    clearButton.onclick = () => {
        let clearWallsButton = document.getElementById("clearWallsButton");
        let clearEverythingButton = document.getElementById("clearEverythingButton");
        let disconnectButtonClickEvents = () => {
            clearWallsButton.onclick = () => {};
            clearEverythingButton.onclick = () => {};
        }
        let onClose = () => {
            disconnectButtonClickEvents();
        };
        let onOpen = () => {
            console.log("connecting button events");
            clearWallsButton.onclick = () => {
                // I have to manually close the entire window when this button is clicked.
                console.log("clear walls only clicked");
                clearWindow.classList.add("hidden");
                activeButtons.set("clearWalls", false);
                totalActiveButtons--;
                onClose();
                clearCloseButton.onclick = () => {};
                // execute the "clear walls" function here
                virtualCanvas.resetWallTilesOnly();
            }
            clearEverythingButton.onclick = () => {
                console.log("clear everything clicked");
                clearWindow.classList.add("hidden");
                activeButtons.set("clearWalls", false);
                totalActiveButtons--;
                onClose();
                clearCloseButton.onclick = () => {};
                // execute the "clear everything" function here
                virtualCanvas.resetAllTiles();
            }
        };

        onPromptButtonClick(clearCloseButton, "clearWalls", clearWindow, onOpen, onClose);
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
    setInterval(frameUpdate, FRAME_TIMING);
}
main();