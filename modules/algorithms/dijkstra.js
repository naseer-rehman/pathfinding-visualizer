import Screen from "/modules/screen.js";
// import Settings?
import Grid from "/modules/grid.js";
import Vector2 from "/modules/vector2.js";
import PlaybackTrack from "/modules/data-structures/playback-track.js";
import PlaybackUpdate from "/modules/data-structures/playback-update.js";
import Tile from "/modules/tile.js";

const WEIGHT_TILE_COST = 10;
const DEFAULT_COST = 1;
const TRAVERSAL_TILE = new Tile(91, 166, 207,1);
const TRAVERSAL_ANIMATION_TIME = 10;
const PATH_TILE = new Tile(209, 203, 23,1);
const PATH_ANIMATION_TIME = 5;
const TYPES_WITH_EDGES = ["weight", "goal", "start", "blank"];
const UPDATES_PER_STEP = 5;
export default class Dijkstra {
    grid = null;
    edgeList = []; // 2D array [y][x] returns neighbour tiles of Tile(x,y)
    isVisited = []; // 2D array [y][x] returns if Tile(x,y) has been visited
    distances = []; // returns [cost {Integer}, previous {Vector 2}]
    traversed = [];

    /**
     * Checks if the tile specified by the coordinates provided is a valid tile which can
     * have an edge.
     * @param {Integer} x 
     * @param {Integer} y 
     * @returns 
     */
    hasEdge(x, y) {
        console.assert(this.grid.isTileCoordinatesOnGrid(x, y));
        let tile = this.grid.getTile(x, y);
        let type = tile.type;
        for (let i = 0; i < TYPES_WITH_EDGES.length; ++i) {
            if (type === TYPES_WITH_EDGES[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Retrieves the cost of moving from a tile to another tile.
     * @param {Vector2} from 
     * @param {Vector2} to 
     * @returns {Integer}
     */
    calculateCost(from, to) {
        if (this.grid) {
            let fromTile = this.grid.getTile(from.X, from.Y);
            let toTile = this.grid.getTile(to.X, to.Y);
            if (fromTile.type === "weight" || toTile.type === "weight") {
                return WEIGHT_TILE_COST;
            }
            return DEFAULT_COST;
        } else {
            console.error("Can't get cost: grid has not been set for dijkstra object");
        }
    }

    getCost(x, y) {
        return this.distances[y][x][0];
    }

    setCost(x, y, val) {
        this.distances[y][x][0] = val;
    }

    getPrevious(x, y) {
        return this.distances[y][x][1];
    }

    setPrevious(x, y, prev) {
        this.distances[y][x][1] = prev;
    }

    getEdges(x, y) {
        return this.edgeList[y][x];
    }

    hasVisited(x, y) {
        return this.isVisited[y][x];
    }

    visit(x,y) {
        this.isVisited[y][x] = true;
    }

    constructor(grid) {
        console.assert(grid);
        this.grid = grid;
        // Create 2D edge list from grid
        // Create 2D visited array
        // Create 2D distances array

        const directions = [new Vector2(1, 0), new Vector2(0, 1), 
            new Vector2(-1, 0), new Vector2(0, -1)];
        for (let r = 0; r < grid.tileGrid.size.Y; ++r) {
            this.edgeList[r] = [];
            this.isVisited[r] = [];
            this.distances[r] = [];
            this.traversed[r] = [];
            for (let c = 0; c < grid.tileGrid.size.X; ++c) {
                let currentTile = grid.getTile(c, r);
                this.edgeList[r][c] = [];
                this.isVisited[r][c] = false;
                this.traversed[r][c] = false;
                this.distances[r][c] = [null, null]; // [cost {Integer}, previous {Vector 2}]
                if (!this.hasEdge(c, r)) {
                    this.isVisited[r][c] = true;
                    continue;
                }
                for (let direction of directions) {
                    let newPos = new Vector2(c + direction.X, r + direction.Y);
                    if (this.grid.isTileCoordinatesOnGrid(newPos.X, newPos.Y) 
                        && this.hasEdge(newPos.X, newPos.Y)) {
                        this.edgeList[r][c].push(newPos);
                    }
                    newPos = null;
                }
            }
        }
    }

    /**
     * Performs Dijkstra's algorithm on this grid and returns a playback track
     * that can visualize the process of the algorithm.
     * @returns {PlaybackTrack}
     */
    createPlaybackTrack() {
        console.log("creating playback track");
        let grid = this.grid;
        let track = new PlaybackTrack();
        let currentStepUpdateCount = 0;

        const startPos = Screen.startingTilePosition;
        const goalPos = Screen.goalTilePosition;
        // Set the start position cost to 0
        this.setCost(startPos.X, startPos.Y, 0);
        this.setPrevious(startPos.X, startPos.Y, null);
        // begin algorithm from start position
        let currentPos = startPos;
        let foundPath = false;
        while (!foundPath) {
            let edges = this.getEdges(currentPos.X, currentPos.Y);
            let currentCost = this.getCost(currentPos.X, currentPos.Y);
            // Look at each neighbour node that is not relaxed, update cost if need be
            for (let edgePos of edges) {
                if (!this.hasVisited(edgePos.X, edgePos.Y)) {
                    let newCost = currentCost + this.calculateCost(currentPos, edgePos);
                    let oldEdgeCost = this.getCost(edgePos.X, edgePos.Y);
                    if (oldEdgeCost === null || oldEdgeCost > newCost) {
                        this.setCost(edgePos.X, edgePos.Y, newCost);
                        this.setPrevious(edgePos.X, edgePos.Y, currentPos);
                        if (edgePos.equals(goalPos)) {
                            foundPath = true;
                            break;
                        }
                    }
                    if (!this.traversed[edgePos.Y][edgePos.X]) {
                        let update = new PlaybackUpdate();
                        update.setAnimationTime(TRAVERSAL_ANIMATION_TIME);
                        update.pushTileUpdate([TRAVERSAL_TILE, edgePos]);
                        ++currentStepUpdateCount;
                        if (currentStepUpdateCount == UPDATES_PER_STEP) {
                            update.setEndOfStep(true);
                            currentStepUpdateCount = 0;
                        }
                        track.pushUpdate(update);
                        this.traversed[edgePos.Y][edgePos.X] = true;
                    }
                }
            }

            // Once each edge is looked at, relax the current node
            this.visit(currentPos.X, currentPos.Y);

            // Check which unvisitted tiles has the least cost
            if (foundPath) break;
            let minCost = null;
            let minPos = new Vector2(-1, -1);
            for (let r = 0; r < grid.tileGrid.size.Y; r++) {
                for (let c = 0; c < grid.tileGrid.size.X; c++) {
                    if (!this.hasVisited(c, r)) {
                        let cost = this.getCost(c, r);
                        if (cost === null) continue;
                        if (minCost === null || minCost > cost) {
                            minCost = cost;
                            minPos.X = c;
                            minPos.Y = r;
                        }
                    }
                }
            }
            if (minCost === null) {
                break;
            } else {
                currentPos = minPos;
            }
        }
        console.log("found path i think");
        // repeat the same process again until the goal tile is reached
        // back track from the goal tile to get the shortest path to the goal tile
        let path = [];
        currentPos = goalPos;
        let prev = this.getPrevious(currentPos.X, currentPos.Y);
        while (prev !== null && !prev.equals(startPos)) {
            let update = new PlaybackUpdate();
            update.setAnimationTime(PATH_ANIMATION_TIME);
            update.pushTileUpdate([PATH_TILE, prev]);
            track.pushUpdate(update);
            currentPos = prev;
            prev = this.getPrevious(currentPos.X, currentPos.Y);
        }
        return track;
    }
}