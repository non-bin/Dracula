import { retIfNotSame } from './utilities.js';

export class Counter {
  name;
  ID;
  state = { value: 0, max: null, phase: null };
  phases;
  // position = {
  //   location: [0, 0],
  //   size: [1, 1]
  // };
  position = '';
  max;
  color;

  // Private Properties
  #elements = {};

  constructor(screen, counterID, counterConfig) {
    this.ID = counterID;

    this.position = counterConfig.position;
    const mainElement = document.createElement('div');
    mainElement.className = 'counter';
    mainElement.classList.add(this.position);
    this.#elements.main = screen.appendChild(mainElement);

    this.name = counterConfig.name;
    const nameElement = document.createElement('div');
    nameElement.classList.add('counter_text', 'counter_name');
    nameElement.textContent = this.name;
    this.#elements.name = mainElement.appendChild(nameElement);

    if (counterConfig.phases) {
      this.state.phase = 0;

      this.phases = counterConfig.phases;
      const phaseElement = document.createElement('div');
      phaseElement.classList.add('counter_text', 'counter_phase');
      phaseElement.textContent = this.phases[0].name;
      this.#elements.phase = mainElement.appendChild(phaseElement);
    }

    const valueElement = document.createElement('div');
    valueElement.classList.add('counter_text', 'counter_value');
    valueElement.textContent = 0;
    this.#elements.value = mainElement.appendChild(valueElement);

    if (counterConfig.max || this.phases?.[0]?.max) {
      this.max = counterConfig.max;

      this.updateCounterMax();

      const maxElement = document.createElement('div');
      maxElement.classList.add('counter_text', 'counter_max');
      maxElement.textContent = `/${this.state.max}`;
      this.#elements.max = mainElement.appendChild(maxElement);
    }

    this.updateCounterColor();
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
