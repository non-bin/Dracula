import Screen from './screen.js';

const HISTORY_LENGTH = 500;

const screen = new Screen(HISTORY_LENGTH);

document.getElementById('increment').addEventListener('click', () => {
  screen.incrementAll();
});
document.getElementById('reset').addEventListener('click', () => {
  screen.resetCounters(HISTORY_LENGTH);
});
