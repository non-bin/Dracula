import Screen from './screen.js';
import * as utils from './utilities.js';

/**
 * Called when a counter's edit button, or move/resize buttons are pressed.
 * Returns false if failed, true otherwise
 */
export type CounterEditHandler = (
  counter: Counter,
  params?: { event: string; direction?: string }
) => boolean;

/**
 * Describe the location and size of a counter.
 * The location [0,0] is the top left.
 * The size [0,0] is 1x1, [1,1] is 2x2, etc.
 */
export type CounterLayout = {
  location: [x: number, y: number];
  size: [width: number, height: number];
};

/**
 * The current state of a counter
 */
export type CounterState = {
  value: number;
  max?: number;
  phase?: number;
};

/**
 * Describes the config of a counter phase
 */
export type CounterPhase = {
  name?: string;
  max?: number;
  color?: string;
};

/**
 * Describes the config of a counter
 */
export type CounterConfig = {
  name?: string;
  layout?: CounterLayout;
  phases?: CounterPhase[];
  color?: string;
  max?: number;
};

export default class Counter {
  #screen: Screen;
  #name: string;
  #state: CounterState;
  #phases: CounterPhase[];
  #max: number;
  #color?: string;
  #elements: { [key: string]: HTMLElement } = {};
  #layout: CounterLayout;
  // = {
  //   location: [0, 0],
  //   size: [0, 0]
  // };

  constructor({
    screenElement,
    config,
    screen,
    editHandler
  }: {
    screenElement: HTMLElement;
    config: CounterConfig;
    screen: Screen;
    editHandler?: CounterEditHandler;
  }) {
    this.#screen = screen;
    this.#state = { value: 0 };

    // Main element
    this.#layout = config.layout || { location: [0, 0], size: [0, 0] };
    const mainElement = document.createElement('div');
    mainElement.className = 'counter';
    this.#elements['main'] = screenElement.appendChild(mainElement);
    this.setLayout(this.#layout);

    // Name element
    this.#name = config.name || '';
    const nameElement = document.createElement('div');
    nameElement.classList.add('counter_text', 'counter_name');
    nameElement.textContent = this.#name;
    this.#elements['name'] = mainElement.appendChild(nameElement);

    // If this counter has phases
    if (config.phases) {
      this.#state.phase = 0;

      // Phase element
      this.#phases = config.phases;
      const phaseElement = document.createElement('div');
      phaseElement.classList.add('counter_text', 'counter_phase');
      phaseElement.textContent = this.#phases[0]?.name || '';
      this.#elements['phase'] = mainElement.appendChild(phaseElement);
    } else {
      this.#phases = [];
    }

    // Value element
    const valueElement = document.createElement('div');
    valueElement.classList.add('counter_text', 'counter_value');
    valueElement.textContent = '0';
    this.#elements['value'] = mainElement.appendChild(valueElement);

    // Setup the initial maximum
    this.#max = Infinity;
    if (config.max || this.#phases[0]?.max) {
      this.#max = config.max || Infinity;

      this.updateCounterMax();

      // Max element
      const maxElement = document.createElement('div');
      maxElement.classList.add('counter_text', 'counter_max');
      maxElement.textContent = `/${this.#state.max}`;
      this.#elements['max'] = mainElement.appendChild(maxElement);
    }

    // Set up edit mode if needed
    if (editHandler) {
      const editButtonElement = document.createElement('button');
      editButtonElement.classList.add('counter-edit-button');
      editButtonElement.textContent = `Edit`;
      editButtonElement.addEventListener('click', () => {
        editHandler(this);
      });
      this.#elements['editButton'] = mainElement.appendChild(editButtonElement);

      this.addMoveButtons(editHandler, 'move');
      this.addMoveButtons(editHandler, 'resize');
    }

    this.updateCounterColor();
  }

  /**
   * Called when a counter is rendered in the editor (created with an {@link CounterEditHandler}).
   * Adds arrow buttons to move and resize the counter
   *
   * moveType defaults to `move`
   *
   * cssClass defaults to `${moveType}-buttons`
   */
  addMoveButtons(
    editHandler: CounterEditHandler,
    moveType: string = 'move',
    cssClass: string = `${moveType}-buttons`
  ) {
    if (!this.#elements['main']) throw new Error('Main element not found');

    const moveButtonsElement = document.createElement(`div`);
    moveButtonsElement.classList.add(cssClass, 'move-button-container');

    const buttonTemplate = document.createElement('button');
    buttonTemplate.classList.add('arrow-button');
    buttonTemplate
      .appendChild(document.createElement('span'))
      .classList.add('arrow');

    let button: HTMLDivElement;
    button = moveButtonsElement.appendChild(
      buttonTemplate.cloneNode(true) as HTMLDivElement
    );
    button.classList.add('up-arrow');
    button.addEventListener('click', () => {
      editHandler(this, { event: moveType, direction: 'up' });
    });
    button = moveButtonsElement.appendChild(
      buttonTemplate.cloneNode(true) as HTMLDivElement
    );
    button.classList.add('down-arrow');
    button.addEventListener('click', () => {
      editHandler(this, { event: moveType, direction: 'down' });
    });
    button = moveButtonsElement.appendChild(
      buttonTemplate.cloneNode(true) as HTMLDivElement
    );
    button.classList.add('left-arrow');
    button.addEventListener('click', () => {
      editHandler(this, { event: moveType, direction: 'left' });
    });
    button = moveButtonsElement.appendChild(
      buttonTemplate.cloneNode(true) as HTMLDivElement
    );
    button.classList.add('right-arrow');
    button.addEventListener('click', () => {
      editHandler(this, { event: moveType, direction: 'right' });
    });

    this.#elements[moveType] =
      this.#elements['main'].appendChild(moveButtonsElement);
  }

  /**
   * Overwrite this counter's layout with a new one
   */
  setLayout(layout: CounterLayout) {
    if (!this.#elements['main']) throw new Error('Main element not found');

    const x1 = layout.location[0] + 1; // CSS Grid locations are 1 indexed
    const y1 = layout.location[1] + 1;
    const x2 = x1 + layout.size[0] + 1; // Decided width should be 0 indexed
    const y2 = y1 + layout.size[1] + 1;

    this.#elements['main'].style.gridArea = `${y1} / ${x1} / ${y2} / ${x2}`;
  }

  /**
   * Move or resize the counter. Performs the move and returns the new layout.
   * (called by the {@link CounterEditHandler})
   */
  updateLayout(
    moveOrResize: 'move' | 'resize',
    direction: 'up' | 'down' | 'left' | 'right'
  ): CounterLayout {
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
   */
  updateCounterColor(newColor?: string) {
    if (!this.#elements['main']) throw new Error('Main element not found');

    let phaseColor: string = '';
    if (this.#state.phase !== undefined) {
      phaseColor = this.#phases?.[this.#state.phase]?.color || '';
    }

    this.#elements['main'].style.setProperty(
      '--color',
      utils.retIfNotSame(
        newColor || phaseColor || this.#color,
        this.#screen.screenColor
      ) || 'color-mix(in oklab, var(--screen-color), rgba(192, 192, 192) 37%)'
    );
  }

  /**
   * Decide on and set a max, based on phase and default max
   */
  updateCounterMax(newMax?: number) {
    let phaseMax = 0;
    if (this.#state.phase !== undefined) {
      phaseMax = this.#phases[this.#state.phase]?.max || 0;
    }

    this.#state.max =
      // newMax || this.#phases?.[this.#state.phase].max || this.#max || Infinity;
      newMax || phaseMax || this.#max || Infinity;
  }

  /**
   * Update displayed color, max, phase, and value
   */
  render(newColor?: string, newMax?: number) {
    if (!this.#elements['value']) throw new Error('Value element not found');

    this.updateCounterColor(newColor);
    this.updateCounterMax(newMax);

    if (this.#phases.length > 0) {
      if (!this.#elements['phase']) throw new Error('Phase element not found');
      if (typeof this.#state.phase === 'undefined')
        throw new Error('Phase not found');
      this.#elements['phase'].textContent =
        this.#phases[this.#state.phase]?.name || '';
    }

    if (this.#elements['max']) {
      this.#elements['max'].textContent = `/${this.#state.max}`;
    }

    this.#elements['value'].textContent = this.#state.value.toString();
  }

  /**
   * Increment the counter, reset if we've reached the max, and change phase if needed
   */
  increment(): CounterState {
    if (!this.#elements['value']) throw new Error('Value element not found');

    const oldState = structuredClone(this.#state);

    this.#state.value++;

    // Enter a block so we can return instead of nesting if statements
    (() => {
      if (!this.#state.max || this.#state.value < this.#state.max) {
        // No max, or haven't reached it yet
        this.#elements['value'].textContent = this.#state.value.toString();
        return;
      }

      this.#state.value = 0;

      if (!this.#phases) {
        this.#elements['value'].textContent = this.#state.value.toString();
        return;
      }

      if (typeof this.#state.phase === 'undefined')
        throw new Error('Phase not found');

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
   */
  revert(state: CounterState) {
    this.#state = structuredClone(state);
    this.render();
  }
}
