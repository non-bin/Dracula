import * as main from './screen.js';

const HISTORY_LENGTH = 500;

main.setupEventListeners(HISTORY_LENGTH);

document.getElementById('increment').addEventListener('click', () => {
  main.incrementAll();
});
document.getElementById('reset').addEventListener('click', () => {
  main.resetCounters(HISTORY_LENGTH);
});
