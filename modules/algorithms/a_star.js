import Screen from "/modules/screen.js";
import Grid from "/modules/grid.js";
import Vector2 from "/modules/vector2.js";
import PlaybackTrack from "/modules/data-structures/playback-track.js";
import PlaybackUpdate from "/modules/data-structures/playback-update.js";
import Tile from "/modules/tile.js";

// constants
const WEIGHT_TILE_COST = 10;
const DEFAULT_COST = 1;
const TRAVERSAL_TILE = new Tile(91, 166, 207,1);
const TRAVERSAL_ANIMATION_TIME = 10;
const PATH_TILE = new Tile(209, 203, 23,1);
const PATH_ANIMATION_TIME = 5;
const TYPES_WITH_EDGES = ["weight", "goal", "start", "blank"];
const UPDATES_PER_STEP = 5;

// This is the implementation of A* using the Euclidean distance between
// tiles as the heuristic distance.
// This is a modification of Dijkstra's algorithm to include this so-called heuristic
// distance. Perhaps I could have made this a child class of the Dijkstra algorith class
// and simply appended it with the heuristic distance.
export default class AStar {
    grid = null;
    edgeList = []; // edgeList[y][x] gives the edges of the tile at (x,y).
    isVisited = []; // 
    hDistances = [];
    distances = [];
    previous = [];

    /**
     * Checks if the tile specified by the coordinates provided is a valid tile which can
     * have an edge.
     * @param {Integer} x 
     * @param {Integer} y 
     * @returns 
     */
     hasEdge(x, y) {
        console.assert(this.grid.isTileCoordinatesOnGrid(x, y), `Not on grid: (${x}, ${y})`);
        let tile = this.grid.getTile(x, y);
        let type = tile.type;
        for (let i = 0; i < TYPES_WITH_EDGES.length; ++i) {
            if (type === TYPES_WITH_EDGES[i]) {
                return true;
            }
        }
        return false;
    }

    constructor(grid) {
        this.grid = grid;
        const tileGrid = Screen.virtualCanvas.tileGrid;
        const tileGridSize = tileGrid.size;
        const goalPos = Screen.goalTilePosition;
        const startPos = Screen.startingTilePosition;
        const edgeDirections = [new Vector2(0, 1), new Vector2(1, 0), 
            new Vector2(0, -1), new Vector2(-1, 0)];
        for (let r = 0; r < tileGridSize.Y; ++r) {
            this.edgeList[r] = [];
            this.isVisited[r] = [];
            this.hDistances[r] = [];
            this.distances[r] = [];
            this.previous[r] = [];
            for (let c = 0; c < tileGridSize.X; ++c) {
                if (!this.hasEdge(c, r)) {
                    // means at position (c, r), it is not a type that has an edge leading to it
                    this.isVisited[r][c] = true;
                    { // setting stuff to null
                        this.previous[r][c] = null; // these are probably unnecessary
                        this.distances[r][c] = null;
                        this.edgeList[r][c] = null;
                        this.hDistances[r][c] = null;
                    }
                    continue;
                }
                this.edgeList[r][c] = [];
                // Manhattan distance
                this.hDistances[r][c] = Math.abs(goalPos.X - c) + Math.abs(goalPos.Y - r);
                this.distances[r][c] = null;
                this.previous[r][c] = null;
                this.isVisited[r][c] = false;
                for (let dir of edgeDirections) {
                    let edgePos = new Vector2(dir.X + c, dir.Y + r);
                    if (this.grid.isTileCoordinatesOnGrid(edgePos.X, edgePos.Y)
                        && this.hasEdge(edgePos.X, edgePos.Y)) {
                        this.edgeList[r][c].push(new Vector2(dir.X + c, dir.Y + r));
                    }
                }
            }
        }
    }

    createPlaybackTrack() {
        const track = new PlaybackTrack();
        const grid = this.grid;
        
        return track;
    }
}