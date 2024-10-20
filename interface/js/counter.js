import { retIfNotSame } from './utilities.js';

export class Counter {
  name;
  ID;
  state = { value: 0, max: null, phase: null };
  phases;
  layout = {
    location: [0, 0],
    size: [1, 1]
  };
  max;
  color;

  // Private Properties
  #elements = {};

  constructor(screen, counterID, counterConfig) {
    this.ID = counterID;

    // Main element
    this.layout = counterConfig.layout;
    const mainElement = document.createElement('div');
    mainElement.className = 'counter';
    this.setLayout(counterConfig.layout, mainElement);
    this.#elements.main = screen.appendChild(mainElement);

    // Name element
    this.name = counterConfig.name;
    const nameElement = document.createElement('div');
    nameElement.classList.add('counter_text', 'counter_name');
    nameElement.textContent = this.name;
    this.#elements.name = mainElement.appendChild(nameElement);

    if (counterConfig.phases) {
      this.state.phase = 0;

      // Phase element
      this.phases = counterConfig.phases;
      const phaseElement = document.createElement('div');
      phaseElement.classList.add('counter_text', 'counter_phase');
      phaseElement.textContent = this.phases[0].name;
      this.#elements.phase = mainElement.appendChild(phaseElement);
    }

    // Value element
    const valueElement = document.createElement('div');
    valueElement.classList.add('counter_text', 'counter_value');
    valueElement.textContent = 0;
    this.#elements.value = mainElement.appendChild(valueElement);

    if (counterConfig.max || this.phases?.[0]?.max) {
      this.max = counterConfig.max;

      this.updateCounterMax();

      // Max element
      const maxElement = document.createElement('div');
      maxElement.classList.add('counter_text', 'counter_max');
      maxElement.textContent = `/${this.state.max}`;
      this.#elements.max = mainElement.appendChild(maxElement);
    }

    this.updateCounterColor();
  }

  setLayout(layout, mainElement = null) {
    mainElement ||= this.#elements.main;

    const x1 = layout.location[0] + 1; // CSS Grid locations are 1 indexed
    const y1 = layout.location[1] + 1;
    const x2 = x1 + layout.size[0];
    const y2 = y1 + layout.size[1];

    mainElement.style.gridArea = `${y1} / ${x1} / ${y2} / ${x2}`;
  }

  updateCounterColor() {
    this.#elements.main.style.setProperty(
      '--color',
      retIfNotSame(
        this.phases?.[this.state.phase].color || this.color,
        window.screenColor
      ) || 'color-mix(in oklab, var(--screen-color), rgba(192, 192, 192) 37%)'
    );
  }

  updateCounterMax() {
    this.state.max = this.phases[this.state.phase].max || this.max || Infinity;
  }

  increment() {
    const valueElement = this.#elements.value;
    const phaseElement = this.#elements.phase;
    const maxElement = this.#elements.max;

    this.state.value++;

    if (!this.state.max || this.state.value < this.state.max) {
      // No max, or haven't reached it yet
      valueElement.textContent = this.state.value;
      return;
    }

    this.state.value = 0;

    if (!this.phases) {
      valueElement.textContent = this.state.value;
      return;
    }

    this.state.phase++;

    if (this.state.phase >= this.phases.length) {
      this.state.phase = 0;
    }

    this.updateCounterColor();
    this.updateCounterMax();

    phaseElement.textContent = this.phases[this.state.phase].name;
    maxElement.textContent = `/${this.state.max}`;

    valueElement.textContent = this.state.value;
  }
}
