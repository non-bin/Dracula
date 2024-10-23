import {
  defaultConfigs,
  generateGridTemplate,
  incrementAll,
  undo
} from './main.js';
import { log, mobileOrTabletCheck, requestFullscreen } from './utilities.js';
import { Counter } from './counter.js';
import { History } from './history.js';

const HISTORY_LENGTH = 500;

const screen = document.getElementById('screen');
let counters;
let history;

const resetCounters = (historyLength) => {
  try {
    if (mobileOrTabletCheck()) requestFullscreen();

    counters = {};
    history = new History(historyLength);

    const configElement = document.getElementById('config');
    const config = JSON.parse(configElement.value);

    screen.innerHTML = '';
    screen.style.gridTemplate = generateGridTemplate(config.grid);
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
    log(error);
  }
};

document.getElementById('increment').addEventListener('click', () => {
  incrementAll(counters, history);
});
document.addEventListener('keydown', (event) => {
  if (event.target.nodeName === 'BODY' && !event.ctrlKey && !event.altKey) {
    if (event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();

      incrementAll(counters, history);
    } else if (event.key === 'z') {
      event.preventDefault();
      event.stopPropagation();

      undo(counters, history);
    } else if (event.key === 'r') {
      event.preventDefault();
      event.stopPropagation();

      resetCounters(HISTORY_LENGTH);
    }
  }
});
document.getElementById('reset').addEventListener('click', () => {
  resetCounters(HISTORY_LENGTH);
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('config').value = JSON.stringify(
    defaultConfigs,
    null,
    2 // eslint-disable-line no-magic-numbers
  );
  resetCounters(HISTORY_LENGTH);
});
