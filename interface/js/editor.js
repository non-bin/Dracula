import * as main from './main.js';
import * as utils from './utilities.js';
import Counter from './counter.js';
import History from './history.js';

const HISTORY_LENGTH = 500;

const screen = document.getElementById('screen');
let counters;
let history;

const resetCounters = (historyLength) => {
  try {
    if (utils.mobileOrTabletCheck()) utils.requestFullscreen();

    counters = {};
    history = new History(historyLength);

    const configElement = document.getElementById('config');
    const config = JSON.parse(configElement.value);

    screen.innerHTML = '';
    screen.style.gridTemplate = main.generateGridTemplate(config.grid);
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
    utils.log(error);
  }
};

document.getElementById('increment').addEventListener('click', () => {
  main.incrementAll(counters, history);
});
document.addEventListener('keydown', (event) => {
  if (event.target.nodeName === 'BODY' && !event.ctrlKey && !event.altKey) {
    if (event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();

      main.incrementAll(counters, history);
    } else if (event.key === 'z') {
      event.preventDefault();
      event.stopPropagation();

      main.undo(counters, history);
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
    main.defaultConfigs,
    null,
    2 // eslint-disable-line no-magic-numbers
  );
  resetCounters(HISTORY_LENGTH);
});
