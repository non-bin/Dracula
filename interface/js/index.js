import * as main from './screen.js';

const HISTORY_LENGTH = 500;

document.addEventListener('keydown', (event) => {
  if (event.target.nodeName === 'BODY' && !event.ctrlKey && !event.altKey) {
    if (event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();

      main.incrementAll();
    } else if (event.key === 'z') {
      event.preventDefault();
      event.stopPropagation();

      main.undo();
    } else if (event.key === 'r') {
      event.preventDefault();
      event.stopPropagation();

      main.resetCounters(HISTORY_LENGTH);
    }
  }
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('config').value = JSON.stringify(
    main.defaultConfigs,
    null,
    2 // eslint-disable-line no-magic-numbers
  );
  main.resetCounters(HISTORY_LENGTH);
});
