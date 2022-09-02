// Sort of a hacky way of waiting for the page to fully load before executing but oh well I guess...
console.log("Loader class woohoo");
export default class Loader {
	static _isLoaded = false;

	static async waitUntilLoad() {
		return new Promise((resolve) => {
			if (Loader._isLoaded) {
				resolve();
			} else {
				let loopsNeeded = 0;
				const readyInterval = setInterval(() => {
					if (document.readyState === "complete") {
						clearInterval(readyInterval);
						console.log(`Loops needed before document completely loaded: ${loopsNeeded}`);
						Loader._isLoaded = true;
						resolve();
					} else {
						console.log("grid lc: ", getComputedStyle(document.body).getPropertyValue("--grid-line-color"));
						++loopsNeeded;
					}
				}, 10);
			}
		});
	}
}