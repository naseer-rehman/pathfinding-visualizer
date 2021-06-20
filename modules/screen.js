import Vector2 from "./vector2.js";
let playButton = document.getElementById("playButton");
let speedScaleButton = document.getElementById("speedScaleButton");
let skipBackwardButton = document.getElementById("skipBackwardButton");
let skipForwardButton = document.getElementById("skipForwardButton");
let markerButton = document.getElementById("markerButton");
let goalButton = document.getElementById("goalButton");
let wallButton = document.getElementById("wallButton");
let weightButton = document.getElementById("weightButton");
let infoButton = document.getElementById("infoButton");

let settingsButton = document.getElementById("settingsButton");
let settingsWindow = document.getElementsByClassName("settings-prompt")[0];
let settingsCloseButton = settingsWindow.querySelector(".close-prompt");

let clearButton = document.getElementById("clearButton");
let clearWindow = document.body.querySelector(".clear-prompt");
let clearCloseButton = clearWindow.querySelector(".close-prompt");
let clearWallsButton = document.getElementById("clearWallsButton");
let clearEverythingButton = document.getElementById("clearEverythingButton");

export default class Screen {
    static ctx; // 2D Context
    static virtualCanvas; // Grid object
    static SCREEN_CENTER;
    static TILE_SIZE;
    static TILE_SIZE_WITH_BORDER;
    static FPS = 60;
    static FRAME_TIMING = 1000 / Screen.FPS;
    static ICON_SIZE = 30;
    static ICON_CORNER_OFFSET;
    static CANVAS_SIZE;
    static MAX_OFFSET;
    static centerOffset;
    static currentMousePosition;
    static goalTilePosition;
    static startingTilePosition;
    static isMouseInViewport;
    static isHoldingRMB;
    static isHoldingMMB;
    static isHoldingLMB;
    static canvas;
    static buttons = {playButton, speedScaleButton, skipBackwardButton, skipForwardButton, markerButton, goalButton, wallButton, weightButton, clearButton, settingsButton, infoButton, settingsCloseButton, clearCloseButton, clearWallsButton, clearEverythingButton};
    static toolbarButtons = {playButton, speedScaleButton, skipBackwardButton, skipForwardButton, markerButton, goalButton, wallButton, weightButton, clearButton, settingsButton, infoButton};
    static windows = {clearWindow, settingsWindow};

    static drawCenterReference() {
        Screen.ctx.strokeStyle = "#A57400";
        Screen.ctx.beginPath();
        Screen.ctx.moveTo(Screen.SCREEN_CENTER.getX() - 10, Screen.SCREEN_CENTER.getY());
        Screen.ctx.lineTo(Screen.SCREEN_CENTER.getX() + 10, Screen.SCREEN_CENTER.getY());
        Screen.ctx.moveTo(Screen.SCREEN_CENTER.getX(), Screen.SCREEN_CENTER.getY() - 10);
        Screen.ctx.lineTo(Screen.SCREEN_CENTER.getX(), Screen.SCREEN_CENTER.getY() + 10);
        Screen.ctx.stroke();
        Screen.ctx.closePath();
    }
    
    
    static drawGridToCenterVector() {
        Screen.ctx.strokeStyle = "#00B029";
        Screen.ctx.beginPath();
        Screen.ctx.moveTo(Screen.SCREEN_CENTER.getX(), Screen.SCREEN_CENTER.getY());
        Screen.ctx.lineTo(Screen.SCREEN_CENTER.getX() + Screen.centerOffset.getX(), Screen.SCREEN_CENTER.getY() + Screen.centerOffset.getY());
        Screen.ctx.stroke();
        Screen.ctx.closePath();
    }

    static isToolbarButton(button) {
        for (const property in this.toolbarButtons) {
            if (button === this.toolbarButtons[property]) {
                return true;
            }
        }
    }
}