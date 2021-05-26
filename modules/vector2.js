export default class Vector2 {
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