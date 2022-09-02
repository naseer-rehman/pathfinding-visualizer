import Deque from "./data-structures/deque.js";

const VISIBLE_TIME = 4000;
const FADE_TIME = 1500;
const TOTAL_TIME = VISIBLE_TIME + FADE_TIME;
const FPS = 30; // frames per second
const FRAME_TIMING = 1000 / FPS; // milliseconds per frame

const MARGIN_BOTTOM = 10; // pixels

function notificationOpacity(timeElapsed) {
    if (0 <= timeElapsed && timeElapsed <= VISIBLE_TIME) {
        return 1;
    } else if (timeElapsed > VISIBLE_TIME) {
        return Math.max(0, 1 / Math.pow(FADE_TIME, 2) * Math.pow(timeElapsed - TOTAL_TIME, 2));
    }
}

class Notification {
    constructor(message) {
        console.assert(typeof message === "string");
        this.timeElapsed = 0;
        this.DELETE_TIME = 3;
        this.documentReference = null;
    }

    setDocumentReference(ref) {
        this.documentReference = ref;
    }

    elapseTime(time) {
        this.timeElapsed += time;
        this.documentReference.style.opacity = notificationOpacity(this.timeElapsed);
    }

    shouldBeDeleted() {
        return this.timeElapsed >= TOTAL_TIME;
    }
}

/*
For positioning notifications:
    - Align notifications with the bottom of the container

*/

export default class NotificationService {
    static notificationTemplate = document.getElementById("notificationTemplate");
    static notificationContainer = document.getElementById("notificationContainer");
    static notificationDeque = new Deque();
    static containerHeight = notificationContainer.offsetHeight;
    static intervalConnection = null;
    constructor () {}

    static getNotificationCount() {
        return this.notificationDeque.length;
    }

    static frameUpdate = () => {
        let currentNode = this.notificationDeque.front;
        while (currentNode !== null) {
            let notif = currentNode.value;
            notif.elapseTime(FRAME_TIMING);
            currentNode = currentNode.next;
        }
        if (this.getNotificationCount() == 0) {
            console.log("no more notifications, stopping updates: " + this.intervalConnection);
            clearInterval(this.intervalConnection);
            this.intervalConnection = null;
        } else {
            let frontNode = this.notificationDeque.front;
            let oldestNotification = frontNode.value;
            if (oldestNotification.shouldBeDeleted()) {
                oldestNotification = this.notificationDeque.removeFront();
                oldestNotification.documentReference.remove();
                frontNode = null;
            }
        }
    }

    static shiftNotifications() {
        let height = MARGIN_BOTTOM;
        let currentNode = this.notificationDeque.back;
        while (currentNode !== null) {
            let notif = currentNode.value;
            notif.documentReference.style.bottom = `${height}px`;
            height += MARGIN_BOTTOM + notif.documentReference.offsetHeight;
            currentNode = currentNode.prev;
        }
    }

    static getTotalNotificationHeight() {
        let height = 0;
        let currentNode = this.notificationDeque.front;
        while (currentNode !== null) {
            let notif = currentNode.value;
            height += MARGIN_BOTTOM + notif.documentReference.offsetHeight;
            currentNode = currentNode.next;
        }
        return height;
    }

    static removeOutOfContainerNotifications() {
        let totalHeight = this.getTotalNotificationHeight();
        let oldestNotif = this.notificationDeque.front.value;
        let oldestNotifHeight = oldestNotif.documentReference.offsetHeight + MARGIN_BOTTOM;

        if (totalHeight - oldestNotifHeight >= this.containerHeight) {
            oldestNotif = this.notificationDeque.removeFront();
            oldestNotif.documentReference.remove();
            oldestNotif = null;
        }
    }

    /**
     * Adds a notification in the document view. Pushes other notifications.
     * @param {String} message 
     */
    static addNotification(message) {
        console.assert(typeof message === "string");

        let notif = new Notification(message); // Create new notification object
        this.notificationDeque.addBack(notif);

        notif.documentReference = this.notificationTemplate.cloneNode(true); // clone and style
        let notifDocumentParagraph = notif.documentReference.children[0]; // maybe querySelector("p")?
        notif.documentReference.id = null;
        notifDocumentParagraph.innerHTML = message;
        this.notificationContainer.appendChild(notif.documentReference);

        NotificationService.removeOutOfContainerNotifications();
        notif.documentReference.classList.remove("hidden");
        NotificationService.shiftNotifications();

        if (this.intervalConnection === null) {
            this.intervalConnection = setInterval(this.frameUpdate, FRAME_TIMING);
        }
    }
}