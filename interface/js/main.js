import { mobileOrTabletCheck, requestFullscreen } from './utilities.js';
import { Counter } from './counter.js';

let counters = {};
/* All counter obj parameters:
{
  internalCounterID: {
    name: 'Counter Display Name',
    position: 'top', // left, right, top, bottom, top-left, top-right, bottom-left, bottom-right
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

const defaultConfigs = {
  grid: { template: '60% auto / 40% auto' },
  color: 'black',
  counters: {
    phase: {
      name: 'Phase',
      // position: {
      //   location: [0, 0],
      //   size: [2, 1]
      // },
      position: 'top',
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
      position: 'bottom-left'
    },
    colour: {
      name: 'Colour',
      position: 'bottom-right',
      phases: [
        { name: 'Red', color: 'red' },
        { name: 'Green', color: 'green' },
        { name: 'Black', color: 'black', max: 2 }
      ],
      max: 3
    }
  }
};

const setup = () => {
  try {
    if (mobileOrTabletCheck()) requestFullscreen();

    counters = {};
    const configElement = document.getElementById('config');
    const config = JSON.parse(configElement.value);

    const screen = document.getElementById('screen');
    screen.innerHTML = '';
    screen.style.gridTemplate = config.grid?.template;
    window.screenColor = config.color || 'white';
    screen.style.setProperty('--screen-color', window.screenColor);

    for (const counterID in config.counters) {
      if (Object.hasOwn(config.counters, counterID)) {
        counters[counterID] = new Counter(
          screen,
          counterID,
          config.counters[counterID]
        );
      }
    }
  } catch (error) {
    document.getElementById('error').innerText = error.message;
    console.error(error); // eslint-disable-line no-console
  }
};

const incrementAll = () => {
  for (const counterID in counters) {
    if (Object.hasOwn(counters, counterID)) {
      counters[counterID].increment();
    }
  }
};

document.getElementById('increment').addEventListener('click', incrementAll);
document.addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    event.preventDefault();
    event.stopPropagation();
    incrementAll();
  }
});
document.getElementById('reset').addEventListener('click', () => {
  setup();
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('config').value = JSON.stringify(
    defaultConfigs,
    null,
    2 // eslint-disable-line no-magic-numbers
  );
  setup();
});
