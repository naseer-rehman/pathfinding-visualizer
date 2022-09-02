import Node from "./deque-node.js";

export default class Deque {
    constructor() {
        this.length = 0;
        this.front = null;
        this.back = null;
    }

    addFront(val) {
        let newNode = new Node(val);
        if (this.length == 0) {
            this.front = newNode;
            this.back = newNode;
        } else {
            newNode.next = this.front;
            this.front.prev = newNode;
            this.front = newNode;
        }
        ++this.length;
    }

    addBack(val) {
        if (this.length == 0) {
            this.addFront(val);
        } else {
            let newNode = new Node(val);
            newNode.prev = this.back;
            this.back.next = newNode;
            this.back = newNode;
            ++this.length;
        }
    }

    removeFront() {
        console.assert(this.length > 0);
        let value;
        if (this.length == 1) {
            value = this.front.value;
            this.front = this.back = null;
        } else {
            let first = this.front;
            let second = first.next;
            value = first.value;
            first.next = null;
            second.prev = null;
            this.front = second;
        }
        --this.length;
        return value;
    }

    removeBack() {
        console.assert(this.length > 0);
        if (this.length == 1) {
            return this.removeFront();
        } else {
            let last = this.back;
            let secondLast = last.prev;
            let value = last.value;
            last.prev = secondLast.next = null;
            this.back = secondLast;
            return value;
        }
    }

    getLength() {
        return this.length;
    }
}