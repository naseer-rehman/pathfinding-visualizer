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
const TILE_SIZE = 38; // Dimensions of the square grid tile.
const TILE_SIZE_WITH_BORDER = 40;
const FPS = 60 // frames
const FRAME_TIMING = 1000 / FPS;
// const CANVAS_SIZE - The virtual canvas size
// const MAX_OFFSET - The max center offset 


// VARIABLES
let centerOffset = null;
// const SCREEN_CENTER - The screen coordinate of its center

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
centerOffset = new Vector2(0, 0);
const SCREEN_CENTER = new Vector2(Math.floor(width / 2), 
                                  Math.floor(height / 2));

class Tile {
    constructor(color = "rgba(0,0,0,0)") {
        this._color = color;
    }

    set color(c) {
        this._color = c;
    }

    get color() {
        return this._color;
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

    // Given a tile coordinate (as a Vector2), the function will return screen coordinate
    //  of the top-left pixel of the specified tile, taking the center-offset into consideration.
    // note: It may or may not be within the viewport
    getScreenCoordinateFromTileCoordinate(tileCoordinate) {
        console.assert(tileCoordinate instanceof Vector2);
        this.calcTopLeftCorner(centerOffset);
        let calculatedCoordinate = new Vector2();
        calculatedCoordinate.X = this.topLeftCorner.X + 1 + tileCoordinate.X * (TILE_SIZE + 1);
        calculatedCoordinate.Y = this.topLeftCorner.Y + 1 + tileCoordinate.Y * (TILE_SIZE + 1);
        return calculatedCoordinate;
    }

    // Given a screen coordainte, the function will return the tile that the screen coordinate resides on.
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
                this.tileGrid.grid[r][c] = new Tile();
            }
        }
    }

    // Set the color of the tile at position (x, y)
    setTileColor(x, y, color) {
        console.assert(0 <= x && x < this.tileGrid.size.X);
        console.assert(0 <= y && y < this.tileGrid.size.y);
        this.tileGrid.grid[y][x].color = color;
    }

    resetTileColor(x, y) {
        this.setTileColor(x, y, "rgba(0,0,0,0)");
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
                let tilePos = this.getScreenCoordinateFromTileCoordinate(new Vector2(c, r));
                ctx.fillStyle = this.tileGrid.grid[r][c].color;
                ctx.fillRect(tilePos.X + 2, tilePos.Y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
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


let topLeftTile = new Vector2(0,0);
function frameUpdate() {
    ctx.clearRect(0, 0, width, height);
    virtualCanvas.draw();
    drawGridToCenterVector();
    drawCenterReference();
}

function disconnectCanvasTranslationEvent() {
    document.onmousedown = null;
    document.onmouseup = null;
    document.onmousemove = null;
}

function connectCanvasTranslationEvent() {
    let isTranslating = false;
    let originalMousePosition = new Vector2();
    let lastMousePosition = new Vector2();
    document.onmousedown = (e) => {
        console.log(e);
        if (e.button == 1 && !isTranslating) {
            isTranslating = true;
            document.body.style.cursor = "grabbing";
            originalMousePosition = new Vector2(e.clientX, e.clientY);
            lastMousePosition = new Vector2(e.clientX, e.clientY);
        }
    }

    document.onmouseup = (e) => {
        if (e.button == 1 && isTranslating) {
            isTranslating = false;
            document.body.style.cursor = "default";
        }
    }

    document.onmousemove = (e) => {
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
    }
}


function main() {
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
    let clearButton = document.getElementById("clearButton");
    let settingsButton = document.getElementById("settingsButton");
    let infoButton = document.getElementById("infoButton");

    let settingsWindow = document.getElementsByClassName("settings-prompt")[0];
    let settingsCloseButton = settingsWindow.querySelector(".close-prompt");

    let clearWindow = document.body.querySelector(".clear-prompt");
    let clearCloseButton = clearWindow.querySelector(".close-prompt");

    let activeButtons = new Map();
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
            }
            clearEverythingButton.onclick = () => {
                console.log("clear everything clicked");
                clearWindow.classList.add("hidden");
                activeButtons.set("clearWalls", false);
                totalActiveButtons--;
                onClose();
                clearCloseButton.onclick = () => {};
                // execute the "clear everything" function here
            }
        };
        onPromptButtonClick(clearCloseButton, "clearWalls", clearWindow, onOpen, onClose);
    };

    speedScaleButton.onclick = () => {
        let speedLabel = document.querySelector(".speed-scale-label");
        speedSetting.current++;
        speedSetting.current = speedSetting.current % speedSetting.speedValues.length;
        speedLabel.innerHTML = speedSetting.speedLabels[speedSetting.current];
    }
    // Other functionality that's important as fuck
    connectCanvasTranslationEvent();
    setInterval(frameUpdate, FRAME_TIMING);
}

main();