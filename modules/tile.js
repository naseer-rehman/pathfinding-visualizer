import Color3 from "./color3.js";

export default class Tile {
    calculateCSSColor() {
        this._CSSColor = `rgba(${this.color.R},${this.color.G},${this.color.B},${this._alpha})`;
        // console.log(this._CSSColor);
    }

    constructor(r, g, b, a) {
        this._color = new Color3(r, g, b);
        this._alpha = a; // a = 1 is fully visible, a = 0 is invisible.
        this.calculateCSSColor();
        this._hasIcon = false;
        this._icon = null;
        this._type = "blank"; // Tile types: blank, wall, start, goal, weight
    }

    set color(c) { 
        // console.log(c instanceof Color3);
        this._color = c;
        this.calculateCSSColor();
    }

    get color() {
        return this._color;
    }

    set alpha(a) {
        // console.log(`Setting alpha to: ${a}`);
        this._alpha = a;
        this.calculateCSSColor();
    }

    get alpha() {
        return this._alpha;
    }

    get CSSColor() {
        return this._CSSColor;
    }

    set type(t) {
        this._type = t;
    }

    get type() {
        return this._type;
    }

    hasIcon() {
        return this._hasIcon;
    }

    setIcon(img) {
        console.assert(img instanceof Image);
        this._hasIcon = true;
        this._icon = img;
    }

    getIcon() {
        return this._icon;
    }

    removeIcon() {
        this._hasIcon = false;
        this._icon = null;
    }
}