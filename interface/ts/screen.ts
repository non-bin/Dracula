import * as utils from './utilities.js';
import ConfigManager from './configManager.js';
import Counter, {
  CounterConfig,
  CounterEditHandler,
  CounterLayout,
  CounterState
} from './counter.js';
import HistoryManager from './historyManager.js';

export type ScreenGrid = {
  rows: string[];
  columns: string[];
};

export type ScreenConfig = {
  grid?: ScreenGrid;
  color?: string;
  counters?: { [s: string]: CounterConfig };
};

export type PostResetCallback = (config: ScreenConfig, screen?: Screen) => void;

export type ScreenGridUpdateOptions = {
  row?: number;
  column?: number;
  newSize: string;
};

export default class Screen {
  #screenElement = document.getElementById('screen');

  #counters!: { [s: string]: Counter };
  #history!: HistoryManager;
  #editHandler: CounterEditHandler | undefined;
  #postResetCallback: PostResetCallback | undefined;
  #config: ScreenConfig;
  #configManager: ConfigManager;
  screenColor!: string;

  constructor(
    historyLength?: number,
    editHandler?: CounterEditHandler,
    postResetCallback?: PostResetCallback
  ) {
    this.#editHandler = editHandler;
    this.#postResetCallback = postResetCallback;

    const searchParams = new URL(window.location.href).searchParams;
    this.#configManager = new ConfigManager(searchParams.get('configID'));

    if (searchParams.get('resetConfigs')) {
      this.initialiseConfigs();
    }

    if (searchParams.get('config')) {
      this.#configManager.newConfig(searchParams.get('config'));
    }

    this.#config = this.#configManager.config;

    document.addEventListener('keydown', (event) => {
      if (!(event.target instanceof HTMLElement)) return;
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

          this.reset(historyLength);
        }
      }
    });
    document.addEventListener('DOMContentLoaded', () => {
      this.reset(historyLength);
    });
  }

  /** Get the current screen grid config */
  getGrid(): ScreenGrid {
    return (
      structuredClone(this.#config.grid) || {
        rows: ['auto'],
        columns: ['auto']
      }
    );
  }

  /** Set a new grid layout for the screen, and render the changes */
  setGrid(grid: ScreenGrid) {
    if (!this.#screenElement) throw new Error('Screen element not found');

    this.#config.grid = grid;

    // CSS grid-template: 'rowWidth rowWidth ... / columnHeight columnHeight ...'
    let template = '';

    if (this.#config.grid?.rows) {
      for (let rowNum = 0; rowNum < this.#config.grid.rows.length; rowNum++) {
        template += `${this.#config.grid.rows[rowNum]} `;
      }
    } else {
      template = 'auto ';
    }

    template += '/';

    if (this.#config.grid?.columns) {
      for (
        let columnNum = 0;
        columnNum < this.#config.grid.columns.length;
        columnNum++
      ) {
        template += ` ${this.#config.grid.columns[columnNum]}`;
      }
    } else {
      template += ' auto';
    }

    this.#screenElement.style.gridTemplate = template;
  }

  /** Make a change to the screen grid, then save, render, and return the new grid */
  updateGrid(updateOptions: ScreenGridUpdateOptions): ScreenGrid {
    if (!this.#config.grid) {
      this.#config.grid = { rows: ['auto'], columns: ['auto'] };
    }

    const row = updateOptions.row;
    const column = updateOptions.column;

    let newSize = updateOptions.newSize;
    if (/^\d+$/.test(newSize)) {
      newSize += 'rem'; // Default units
    }

    if (typeof row !== 'undefined') {
      this.#config.grid.rows[row] = newSize;
    } else if (typeof column !== 'undefined') {
      this.#config.grid.columns[column] = newSize;
    }

    this.setGrid(this.#config.grid);

    return this.#config.grid;
  }

  /** Loop through all counters, increment them, and save the old state to the history */
  incrementAll() {
    const states: { [s: string]: CounterState } = {};
    for (const counterID in this.#counters) {
      if (
        Object.hasOwn(this.#counters, counterID) &&
        this.#counters[counterID]
      ) {
        states[counterID] = this.#counters[counterID].increment();
      }
    }

    this.#history.push(states);
  }

  /** Take a state from the history and apply it */
  undo() {
    const newStates = this.#history.pop();
    if (!newStates) {
      utils.log(new Error('History empty'));
      return;
    }

    for (const counterID in newStates) {
      if (Object.hasOwn(newStates, counterID)) {
        this.#counters[counterID]?.revert(newStates[counterID]);
      }
    }
  }

  /**
   * Overwrite the current counters and states, with the initial state from config
   * (Called when the page loads, or when the user requests a reset)
   */
  reset(historyLength?: number) {
    try {
      if (!this.#screenElement) throw new Error('Screen element not found');

      this.#counters = {};
      this.#history = new HistoryManager(historyLength);

      this.#config = this.#configManager.config;

      this.#screenElement.innerHTML = '';
      this.setGrid(this.#config.grid || { rows: ['auto'], columns: ['auto'] });
      this.screenColor = this.#config.color || 'white';
      this.#screenElement.style.setProperty('--screen-color', this.screenColor);

      for (const counterID in this.#config.counters) {
        if (
          Object.hasOwn(this.#config.counters, counterID) &&
          this.#config.counters[counterID]
        ) {
          this.#counters[counterID] = new Counter({
            screenElement: this.#screenElement,
            config: this.#config.counters[counterID],
            screen: this,
            editHandler: this.#editHandler
          });
        }
      }

      this.#postResetCallback?.(this.#config, this);
    } catch (error) {
      utils.log(error);
    }
  }

  getAvailableConfigIDs(): string[] {
    return this.#configManager.getAvailableConfigsList();
  }

  getCurrentConfigID(): string {
    return this.#configManager.currentConfigID;
  }

  /**
   * Returns false if the switch failed, true if successful
   */
  switchConfig(configID: string): boolean {
    if (!this.#configManager.switchConfig(configID)) return false;

    this.reset();
    return true;
  }

  saveChanges() {
    this.#configManager.saveChanges();
  }

  /**
   * Deletes all saved configs, and reverts to the default state
   */
  initialiseConfigs() {
    this.#configManager.initialiseConfigs();
  }

  /**
   * Deletes all saved configs, and reverts to the default state
   */
  static initialisePreferences() {
    ConfigManager.initialisePreferences();
  }

  /**
   * Validate and save a user preference
   */
  static setPreference(key: string, value: any) {
    if (typeof key !== 'string') {
      throw new Error('Key must be a string');
    }
    if (typeof value === 'undefined') {
      throw new Error('Value must not be undefined');
    }

    switch (key) {
      case 'mobileFullscreen':
        utils.assertType(value, 'boolean');
        break;

      default:
        throw new Error(`Unknown preference key: ${key}`);
    }

    ConfigManager.setPreference(key, value);
  }

  /**
   * Get a user preference, or the default value if null
   */
  static getPreference(key: string): any {
    const preferenceValue = ConfigManager.getPreference(key);

    switch (key) {
      case 'mobileFullscreen':
        return utils.fallbackIfInvalidType(preferenceValue, 'boolean', true);

      default:
        throw new Error(`Unknown preference key: ${key}`);
    }
  }
}
