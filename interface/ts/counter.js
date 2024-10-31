import * as utils from './utilities.js';

/**
 * Called when a counter's edit button, or move/resize buttons are pressed
 *
 * @callback CounterEditHandler
 * @param {Counter} counter
 * @param {Object} [params=]
 * @param {String} params.event
 * @param {String?} params.direction
 * @return {Boolean} False if failed, true otherwise
 */

/**
 * Describes the location and size of a counter
 *
 * @typedef {Object} CounterLayout
 * @property {[x:Number,y:Number]} location 0,0 is the top left
 * @property {[width:Number,height:Number]} size
 * 0,0 is 1x1
 *
 * 2,3 is 3x4
 */

/**
 * The current state of the counter
 *
 * @typedef {Object} CounterState
 * @property {Number} value
 * @property {Number?} max
 * @property {Number?} phase
 */

/**
 * Describes the behavious or a counter phase
 * @typedef {Object} CounterPhase
 * @property {String?} name
 * @property {Number?} max
 * @property {String?} color
 */

/**
 * @typedef {Object} CounterConfig
 * @property {String?} name
 * @property {CounterLayout?} layout
 * @property {CounterPhase[]?} phases
 * @property {String?} color
 */

export default class Counter {
  /** @type {String} */ #name;
  /** @type {CounterState} */ #state;
  /** @type {CounterPhase[]} */ #phases;
  /** @type {Number} */ #max;
  /** @type {String} */ #color;
  /** @type {Object.<string, HTMLElement>[]} */ #elements = {};

  /** @type {CounterLayout} */
  #layout = {
    location: [0, 0],
    size: [0, 0]
  };

  /**
   * @param {Object} params
   * @param {HTMLElement} params.screenElement
   * @param {CounterConfig} params.config
   * @param {CounterEditHandler?} params.editHandler
   */
  constructor(params) {
    const { screenElement, config, editHandler = null } = params;
    this.#state = { value: 0 };

    // Main element
    this.#layout = config.layout || { location: [0, 0], size: [0, 0] };
    const mainElement = document.createElement('div');
    mainElement.className = 'counter';
    this.#elements.main = screenElement.appendChild(mainElement);
    this.setLayout(this.#layout);

    // Name element
    this.#name = config.name;
    const nameElement = document.createElement('div');
    nameElement.classList.add('counter_text', 'counter_name');
    nameElement.textContent = this.#name;
    this.#elements.name = mainElement.appendChild(nameElement);

    // If this counter has phases
    if (config.phases) {
      this.#state.phase = 0;

      // Phase element
      this.#phases = config.phases;
      const phaseElement = document.createElement('div');
      phaseElement.classList.add('counter_text', 'counter_phase');
      phaseElement.textContent = this.#phases[0].name;
      this.#elements.phase = mainElement.appendChild(phaseElement);
    }

    // Value element
    const valueElement = document.createElement('div');
    valueElement.classList.add('counter_text', 'counter_value');
    valueElement.textContent = 0;
    this.#elements.value = mainElement.appendChild(valueElement);

    // Setup the initial maximum
    if (config.max || this.#phases?.[0]?.max) {
      this.#max = config.max;

      this.updateCounterMax();

      // Max element
      const maxElement = document.createElement('div');
      maxElement.classList.add('counter_text', 'counter_max');
      maxElement.textContent = `/${this.#state.max}`;
      this.#elements.max = mainElement.appendChild(maxElement);
    }

    // Set up edit mode if needed
    if (editHandler) {
      const editButtonElement = document.createElement('button');
      editButtonElement.classList.add('counter-edit-button');
      editButtonElement.textContent = `Edit`;
      editButtonElement.addEventListener('click', () => {
        editHandler(this);
      });
      this.#elements.editButton = mainElement.appendChild(editButtonElement);

      this.addMoveButtons(editHandler, 'move');
      this.addMoveButtons(editHandler, 'resize');
    }

    this.updateCounterColor();
  }

  /**
   * Called when a counter is rendered in the editor (created with an {@link CounterEditHandler})
   * Adds arrow buttons to move and resize the counter
   *
   * @param {CounterEditHandler} editHandler
   * @param {String?} moveType Default: `move`
   * @param {String?} cssClass Default: `${moveType}-buttons`
   */
  addMoveButtons(
    editHandler,
    moveType = 'move',
    cssClass = `${moveType}-buttons`
  ) {
    const moveButtonsElement = document.createElement(`div`);
    moveButtonsElement.classList.add(cssClass, 'move-button-container');

    const buttonTemplate = document.createElement('button');
    buttonTemplate.classList.add('arrow-button');
    buttonTemplate
      .appendChild(document.createElement('span'))
      .classList.add('arrow');

    let button;
    button = moveButtonsElement.appendChild(buttonTemplate.cloneNode(true));
    button.classList.add('up-arrow');
    button.addEventListener('click', () => {
      editHandler(this, { event: moveType, direction: 'up' });
    });
    button = moveButtonsElement.appendChild(buttonTemplate.cloneNode(true));
    button.classList.add('down-arrow');
    button.addEventListener('click', () => {
      editHandler(this, { event: moveType, direction: 'down' });
    });
    button = moveButtonsElement.appendChild(buttonTemplate.cloneNode(true));
    button.classList.add('left-arrow');
    button.addEventListener('click', () => {
      editHandler(this, { event: moveType, direction: 'left' });
    });
    button = moveButtonsElement.appendChild(buttonTemplate.cloneNode(true));
    button.classList.add('right-arrow');
    button.addEventListener('click', () => {
      editHandler(this, { event: moveType, direction: 'right' });
    });

    this.#elements.move ||= {};
    this.#elements.move[moveType] =
      this.#elements.main.appendChild(moveButtonsElement);
  }

  /**
   * Overwrite this counter's layout with a new one
   *
   * @param {CounterLayout} layout
   */
  setLayout(layout) {
    const x1 = layout.location[0] + 1; // CSS Grid locations are 1 indexed
    const y1 = layout.location[1] + 1;
    const x2 = x1 + layout.size[0] + 1; // Decided width should be 0 indexed
    const y2 = y1 + layout.size[1] + 1;

    this.#elements.main.style.gridArea = `${y1} / ${x1} / ${y2} / ${x2}`;
  }

  /**
   * Move or resize the counter. Performs the move and returns the new layout.
   * (called by the {@link CounterEditHandler})
   *
   * @param {('move'|'resize')} moveOrResize
   * @param {('up'|'down'|'left'|'right')} direction
   * @returns {CounterLayout} New layout
   */
  updateLayout(moveOrResize, direction) {
    let positionOrSize;

    // Get the appropriate object, to edit in the next step
    if (moveOrResize === 'resize') {
      positionOrSize = this.#layout.size;
    } else {
      positionOrSize = this.#layout.location;
    }

    switch (direction) {
      case 'right':
        positionOrSize[0]++;
        break;
      case 'left':
        if (positionOrSize[0]) positionOrSize[0]--; // Keep dimensions and position positive
        break;
      case 'up':
        if (positionOrSize[1]) positionOrSize[1]--; // Keep dimensions and position positive
        break;
      case 'down':
        positionOrSize[1]++;
        break;

      default:
        throw new Error('Unknown direction');
    }

    this.setLayout(this.#layout);
    return structuredClone(this.#layout);
  }

  /**
   * Decide on and set a color, based on phase, default color, and screen color
   *
   * @param {String?} newColor
   */
  updateCounterColor(newColor) {
    this.#elements.main.style.setProperty(
      '--color',
      utils.retIfNotSame(
        newColor || this.#phases?.[this.#state.phase].color || this.#color,
        window.screenColor
      ) || 'color-mix(in oklab, var(--screen-color), rgba(192, 192, 192) 37%)'
    );
  }

  /**
   * Decide on and set a max, based on phase and default max
   *
   * @param {Number?} newMax
   */
  updateCounterMax(newMax) {
    this.#state.max =
      newMax || this.#phases?.[this.#state.phase].max || this.#max || Infinity;
  }

  /**
   * Update displayed color, max, phase, and value
   *
   * @param {String?} newColor
   * @param {Number?} newMax
   */
  render(newColor, newMax) {
    this.updateCounterColor(newColor);
    this.updateCounterMax(newMax);

    if (this.#phases) {
      this.#elements.phase.textContent = this.#phases[this.#state.phase].name;
    }

    if (this.#elements.max) {
      this.#elements.max.textContent = `/${this.#state.max}`;
    }

    this.#elements.value.textContent = this.#state.value;
  }

  /**
   * Increment the counter, reset if we've reached the max, and change phase if needed
   *
   * @returns {CounterState} The previous state, to be saved in the history
   */
  increment() {
    const oldState = structuredClone(this.#state);

    this.#state.value++;

    // Enter a block so we can return instead of nesting if statements
    (() => {
      if (!this.#state.max || this.#state.value < this.#state.max) {
        // No max, or haven't reached it yet
        this.#elements.value.textContent = this.#state.value;
        return;
      }

      this.#state.value = 0;

      if (!this.#phases) {
        this.#elements.value.textContent = this.#state.value;
        return;
      }

      this.#state.phase++;

      if (this.#state.phase >= this.#phases.length) {
        this.#state.phase = 0;
      }
    })();

    this.render();

    return oldState;
  }

  /**
   * Set the counter's state. Used to undo
   *
   * @param {CounterState} state
   */
  revert(state) {
    this.#state = structuredClone(state);
    this.render();
  }
}
