export default class HistoryManager {
  #maxLength = 500;
  /** @type {*[]} */ #states = [];

  /**
   * @param {Number?} maxLength
   */
  constructor(maxLength) {
    this.#maxLength = maxLength || this.#maxLength;
  }

  /**
   * Add a state to the history
   *
   * @param {*} newState
   */
  push(newState) {
    if (this.#states.length >= this.#maxLength) {
      this.#states.shift(); // Remove the oldest item
    }

    this.#states.push(structuredClone(newState));
  }

  /**
   * Remove a state from the history and return it
   *
   * @return {*} The state
   */
  pop() {
    return this.#states.pop();
  }
}
