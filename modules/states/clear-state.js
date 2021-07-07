import Screen from "/modules/screen.js";

export default class ClearState {
    constructor() {
        this.windowOpen = false;
    }
    
    enter() {
        Screen.windows.clearWindow.classList.remove("hidden");
        Screen.buttons.clearButton.classList.add("active-button");
        this.windowOpen = true;
    }

    exit() {
        Screen.windows.clearWindow.classList.add("hidden");
        Screen.buttons.clearButton.classList.remove("active-button");
        this.windowOpen = false;
    }

    handleButtonInput(button, actionType) {
        if (actionType !== "click") return;

        if (button === Screen.buttons.clearButton) {
            if (this.windowOpen) {
                this.exit();
            } else {
                this.enter();
            }
        } else if (button === Screen.buttons.clearCloseButton ||
            Screen.isToolbarButton(button)) {
            this.exit();
        } else if (button === Screen.buttons.clearEverythingButton) {
            Screen.virtualCanvas.resetAllTiles();
            this.exit();
        } else if (button === Screen.buttons.clearWallsButton) {
            Screen.virtualCanvas.resetWallTilesOnly();
            this.exit();
        }
    }

    toString() {
        return "ClearState";
    }

    handleMouseInput(eventInfo, actionType) {}
    frameUpdate() {}
}