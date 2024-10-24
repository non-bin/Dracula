import * as utils from './utilities.js';

export default class Counter {
  #name;
  #state = { value: 0, max: null, phase: null };
  #phases;
  #layout = {
    location: [0, 0],
    size: [1, 1]
  };
  #max;
  #color;

  // Private Properties
  #elements = {};

  constructor({ screenElement, config, editHandler = null }) {
    // Main element
    this.#layout = config.layout;
    const mainElement = document.createElement('div');
    mainElement.className = 'counter';
    this.setLayout(this.#layout, mainElement);
    this.#elements.main = screenElement.appendChild(mainElement);

    // Name element
    this.#name = config.name;
    const nameElement = document.createElement('div');
    nameElement.classList.add('counter_text', 'counter_name');
    nameElement.textContent = this.#name;
    this.#elements.name = mainElement.appendChild(nameElement);

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

    if (config.max || this.#phases?.[0]?.max) {
      this.#max = config.max;

      this.updateCounterMax();

      // Max element
      const maxElement = document.createElement('div');
      maxElement.classList.add('counter_text', 'counter_max');
      maxElement.textContent = `/${this.#state.max}`;
      this.#elements.max = mainElement.appendChild(maxElement);
    }

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

  setLayout(layout = this.#layout, mainElement = this.#elements.main) {
    const x1 = layout.location[0] + 1; // CSS Grid locations are 1 indexed
    const y1 = layout.location[1] + 1;
    const x2 = x1 + layout.size[0];
    const y2 = y1 + layout.size[1];

    mainElement.style.gridArea = `${y1} / ${x1} / ${y2} / ${x2}`;
  }

  updateLayout(moveOrResize, direction) {
    let positionOrSize;

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
        if (positionOrSize[0]) positionOrSize[0]--;
        break;
      case 'up':
        if (positionOrSize[0]) positionOrSize[1]--;
        break;
      case 'down':
        positionOrSize[1]++;
        break;

      default:
        throw new Error('Unknown direction');
    }

    this.setLayout();
  }

  updateCounterColor() {
    this.#elements.main.style.setProperty(
      '--color',
      utils.retIfNotSame(
        this.#phases?.[this.#state.phase].color || this.#color,
        window.screenColor
      ) || 'color-mix(in oklab, var(--screen-color), rgba(192, 192, 192) 37%)'
    );
  }

  updateCounterMax() {
    this.#state.max =
      this.#phases?.[this.#state.phase].max || this.#max || Infinity;
  }

  render() {
    this.updateCounterColor();
    this.updateCounterMax();

    if (this.#phases) {
      this.#elements.phase.textContent = this.#phases[this.#state.phase].name;
    }

    if (this.#elements.max) {
      this.#elements.max.textContent = `/${this.#state.max}`;
    }

    this.#elements.value.textContent = this.#state.value;
  }

  increment() {
    const oldState = structuredClone(this.#state);

    this.#state.value++;

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

  revert(state) {
    this.#state = structuredClone(state);
    this.render();
  }
}
