import IdleState from "./states/idle-state.js";
import ClearState from "./states/clear-state.js";
import EditingSettingsState from "./states/editing-settings-state.js";

export default class UserState {
    static idleState = new IdleState();
    static clearState = new ClearState();
    static editingSettingsState = new EditingSettingsState();
    currentState = null;
    
    constructor() {
        this.currentState = UserState.idleState;
    }

    handleButtonInput(button, actionType, nextState = this.currentState) {
        this.currentState.handleButtonInput(button, actionType);
        if (nextState !== this.currentState) {
            this.currentState = nextState;
            this.currentState.handleButtonInput(button, actionType);
        }
    }

    handleMouseInput(eventInfo, actionType) {
        this.currentState.handleMouseInput(eventInfo, actionType);
    }

    frameUpdate() {
        this.currentState.frameUpdate();
    }
}