import Deque from "./deque.js";

export default class Queue {
    constructor () {
        this.deque = new Deque();
    }

    push(val) {
        this.deque.addBack(val);
    }

    pop() {
        return this.deque.removeFront();
    }

    peekFront() {
        return this.deque.front.value;
    }

    peekBack() {
        return this.deque.back.value;
    }

    [Symbol.iterator]() {
        let current = this.deque.front;
        return {
            next: () => {
                if (current === null) {
                    return {done: true, value: undefined};
                } else {
                    let currentValue = current.value;
                    current = current.next;
                    return {done: false, value: currentValue};
                }
            }
        };
    }

    get length() {
        return this.deque.getLength();
    }
}