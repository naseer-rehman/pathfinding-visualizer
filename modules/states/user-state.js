import EditingSettingsState from "./editing-settings-state";
import PlayingState from "./auto-playing-state";
import IdleState from "./idle-state";

export default class UserState {
    static playingState = new PlayingState();
    static changingSettingsState = new EditingSettingsState();
    static idleState = new IdleState();

    // enter() {}
    // exit() {}
    // handleInput() {}
    // constructor() {}
}