export default class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Produces a new vector from the addition of the provided vector with this vector.
     * @param {Vector2} vector2 
     * @returns {Vector2}
     */
    add(vector2) {
        console.assert(vector2 instanceof Vector2);
        return new Vector2(this.x + vector2.x, this.y + vector2.y);
    }

    /**
     * Produces a new vector from the subtraction of the provided vector from this vector.
     * @param {Vector2} vector2 
     * @returns {Vector2}
     */
    sub(vector2) {
        console.assert(vector2 instanceof Vector2);
        return new Vector2(this.x - vector2.x, this.y - vector2.y);
    }

    /**
     * Produces a new vector that is the result of scaling this vector by the provided amount.
     * @param {Vector2} scalar 
     * @returns {Vector2}
     */
    scale(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    /**
     * Calculates the Euclidean distance between this vector and the provided vector.
     * @param {Vector2} vector2 
     * @returns {Number}
     */
    dist(vector2) {
        console.assert(vector2 instanceof Vector2);
        let delta = vector2.sub(this);
        return Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    }

    /**
     * Checks if the provided vector is equal to this vector in value.
     * @param {Vector2} vector2 
     * @returns {Boolean}
     */
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