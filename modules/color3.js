export default class Color3 {
    constructor(r, g, b) {
        this._r = r;
        this._g = g;
        this._b = b;
    }
    get R() { return this._r; }
    get G() { return this._g; }
    get B() { return this._b; }
    set R(r) { this._r = r; }
    set G(g) { this._g = g; }
    set B(b) { this._b = b; } 
    setRGB(r, g, b) {
        this.R = r;
        this.G = g;
        this.B = b;
    }
}