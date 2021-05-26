import Vector2 from "./vector2.js";

export default class Screen {
    static ctx;
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
}