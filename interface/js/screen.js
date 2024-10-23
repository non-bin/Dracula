import * as utils from './utilities.js';
import Counter from './counter.js';
import HistoryManager from './historyManager.js';

/* All counter obj parameters:
{
  internalCounterID: {
    name: 'Counter Display Name',
    layout: {
      location: [0, 0], // x and y location of the top left corner
      size: [2, 1] // width and height of the counter
    },
    max: 12, // Number to stop counting at (inclusive), or Infinity, or omit to imply Infinity
    phases: [
      {
        name: 'Phase Display Name',
        max: 30, // Number, Infinity, or omit to inherit the counter's max
      },
      {...}
    ],
    state: { // Used internally
      value: 16, // Current count we're up to (within a state if it has them)
      phase: 2, // Current phase number
      max: 23 // Current max (of the phase if it has one)
    },
    elements: { // Used internally
      main: <DOM Node>, // Counter div
      name: <DOM Node>, // Counter name element
      phase: <DOM Node>, // Phase name
      value: <DOM Node>, // Current value
      max: <DOM Node>, // Current max
    }
  },
}
*/

export default class Screen {
  #screenElement = document.getElementById('screen');
  #counters;
  #history;

  static defaultConfigs = {
    grid: { rows: ['60%', 'auto'], columns: ['40%', 'auto'] },
    color: 'black',
    counters: {
      phase: {
        name: 'Phase',
        layout: {
          location: [0, 0],
          size: [2, 1]
        },
        phases: [
          { name: 'Hem', max: 30 },
          { name: 'Ankle', max: 50 },
          { name: 'Heel Decrease', max: 15 },
          { name: 'Heal Increase', max: 15 },
          { name: 'Foot', max: 60 },
          { name: 'Toe Decrease', max: 15 },
          { name: 'Toe Increase', max: 15 },
          { name: 'Waste Yarn' }
        ]
      },
      total: {
        name: 'Total',
        color: 'green',
        layout: {
          location: [0, 1],
          size: [1, 1]
        }
      },
      colour: {
        name: 'Colour',
        layout: {
          location: [1, 1],
          size: [1, 1]
        },
        phases: [
          { name: 'Red', color: 'red' },
          { name: 'Green', color: 'green' },
          { name: 'Black', color: 'black', max: 2 }
        ],
        max: 3
      }
    }
  };

  static generateGridTemplate({ rows, columns }) {
    let template = '';

    if (rows) {
      for (let rowNum = 0; rowNum < rows.length; rowNum++) {
        template += `${rows[rowNum]} `;
      }
    } else {
      template = 'auto ';
    }

    template += '/';

    if (columns) {
      for (let columnNum = 0; columnNum < columns.length; columnNum++) {
        template += ` ${columns[columnNum]}`;
      }
    } else {
      template += ' auto';
    }

    return template;
  }

  constructor(historyLength) {
    document.addEventListener('keydown', (event) => {
      if (event.target.nodeName === 'BODY' && !event.ctrlKey && !event.altKey) {
        if (event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();

          this.incrementAll();
        } else if (event.key === 'z') {
          event.preventDefault();
          event.stopPropagation();

          this.undo();
        } else if (event.key === 'r') {
          event.preventDefault();
          event.stopPropagation();

          this.resetCounters(historyLength);
        }
      }
    });
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('config').value = JSON.stringify(
        Screen.defaultConfigs,
        null,
        2 // eslint-disable-line no-magic-numbers
      );
      this.resetCounters(historyLength);
    });
  }

  incrementAll() {
    const states = {};
    for (const counterID in this.#counters) {
      if (Object.hasOwn(this.#counters, counterID)) {
        states[counterID] = this.#counters[counterID].increment();
      }
    }

    this.#history.push(states);
  }

  undo() {
    const newStates = this.#history.pop();
    if (!newStates) {
      utils.log(new Error('History empty'));
      return;
    }

    for (const counterID in newStates) {
      if (Object.hasOwn(newStates, counterID)) {
        this.#counters[counterID].revert(newStates[counterID]);
      }
    }
  }

  resetCounters(historyLength) {
    try {
      if (utils.mobileOrTabletCheck()) utils.requestFullscreen();

      this.#counters = {};
      this.#history = new HistoryManager(historyLength);

      const configElement = document.getElementById('config');
      const config = JSON.parse(configElement.value);

      this.#screenElement.innerHTML = '';
      this.#screenElement.style.gridTemplate = Screen.generateGridTemplate(
        config.grid
      );
      window.screenColor = config.color || 'white';
      this.#screenElement.style.setProperty(
        '--screen-color',
        window.screenColor
      );

      for (const counterID in config.counters) {
        if (Object.hasOwn(config.counters, counterID)) {
          this.#counters[counterID] = new Counter(
            this.#screenElement,
            counterID,
            config.counters[counterID]
          );
        }
      }
    } catch (error) {
      utils.log(error);
    }
  }
}
