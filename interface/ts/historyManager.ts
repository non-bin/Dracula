export default class HistoryManager {
  #maxLength = 500;
  #states: any[] = [];

  constructor(maxLength?: number) {
    this.#maxLength = maxLength || this.#maxLength;
  }

  /**
   * Add a state to the history
   */
  push(newState: {}) {
    if (this.#states.length >= this.#maxLength) {
      this.#states.shift(); // Remove the oldest item
    }

    this.#states.push(structuredClone(newState));
  }

  /**
   * Remove a state from the history and return it
   */
  pop(): any {
    return this.#states.pop();
  }
}
