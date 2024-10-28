import exampleConfigs from './exampleConfigs.js';

/**
 * @typedef {import('./screen').ScreenConfig} ScreenConfig
 */

export default class ConfigManager {
  /** @type {String} */ #currentConfigID;
  /** @type {ScreenConfig[]} */ #configs;
  /** @type {ScreenConfig|null} */ config;

  /**
   * Initialise the config storage if not done already, then load either the
   * requested config, the first available one, or null if none are available
   * or the requested on doesn't exist
   *
   * @param {String?} configID
   */
  constructor(configID) {
    if (!Object.hasOwn(localStorage, 'configs')) {
      ConfigManager.initialiseConfigs();
    }

    this.#configs = JSON.parse(localStorage.configs);

    if (this.getAvailableConfigsList().length > 0) {
      this.switchConfig(configID || this.getAvailableConfigsList()[0]);
    } else this.#currentConfigID = configID;
  }

  /**
   * Reset configs to defaults
   */
  initialiseConfigs() {
    this.#configs = structuredClone(exampleConfigs);
    this.switchConfig(this.getAvailableConfigsList()[0]);
    this.saveChanges();
  }

  /**
   * Reset user preferences to defaults
   */
  static initialisePreferences() {
    const configs = localStorage.configs;
    localStorage.clear();
    localStorage.configs = configs;
  }

  /**
   * @returns {String[]} List of the IDs of all saved configs
   */
  getAvailableConfigsList() {
    return Object.keys(this.#configs);
  }

  /**
   * Returns false if the switch failed
   * @param {String} configID
   * @returns {ScreenConfig|false}
   */
  switchConfig(configID) {
    if (
      typeof configID === 'string' &&
      this.getAvailableConfigsList().includes(configID)
    ) {
      this.config = this.#configs[configID];
      this.#currentConfigID = configID;
      return true;
    }
    return false;
  }

  saveChanges() {
    localStorage.configs = JSON.stringify(this.#configs);
  }

  get currentConfigID() {
    return this.#currentConfigID;
  }

  /**
   * Get a stored preference value from local storage, and convert it back from JSON
   *
   * @param {String} key
   * @returns {*}
   */
  static getPreference(key) {
    if (key === 'configs') throw new Error("Illegal preference key 'configs'");
    if (!localStorage[key]) return null;

    return JSON.parse(localStorage[key]);
  }

  /**
   * Convert value to a JSON string, and save it to the preferences store
   *
   * @param {String} key
   * @param {*} value
   */
  static setPreference(key, value) {
    if (key === 'configs') throw new Error("Illegal preference key 'configs'");

    localStorage[key] = JSON.stringify(value);
  }
}
