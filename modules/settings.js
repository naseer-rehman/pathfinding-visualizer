const MAX_PLAYBACK_SPEED = 2.0;

export default class Settings {
    static ALGORITHMS = {
        DIJKSTRA : 0,
        A_STAR : 1
    }
    static algorithm = "dijkstra";
    static playbackMode = "auto";
    static playbackSpeed = 1.0;

    static setPlaybackMode(mode) {
        this.playbackMode = mode;
    }

    static getPlaybackMode() {
        return this.playbackMode;
    }

    static setAlgorithm(algo) {
        this.algorithm = algo;
    }

    static getAlgorithm() {
        return this.algorithm;
    }

    static cyclePlaybackSpeed() {
        this.playbackSpeed = this.playbackSpeed % 2.0 + 0.5;
    }

    static getPlaybackSpeed() {
        return this.playbackSpeed;
    }

    static set(setting, value) {
        if (setting === "algorithm") {
            Settings.setAlgorithm(value);
        } else if (setting === "playbackMode") {
            Settings.setPlaybackMode(value);
        }
    }
}