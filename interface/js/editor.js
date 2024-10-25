import Screen from './screen.js';
/** @type {Screen} */
// eslint-disable-next-line prefer-const
let screen;

/**
 * @typedef {import('./counter.js').default} Counter
 * @typedef {import('./counter.js').CounterEditHandler} CounterEditHandler
 * @typedef {import('./screen.js').ScreenGrid} ScreenGrid
 * @typedef {import('./screen.js').PostResetCallback} PostResetCallback
 */

const HISTORY_LENGTH = 500;

const sideRulerElement = document.getElementById('side-ruler');
const topRulerElement = document.getElementById('top-ruler');
const configListElement = document.getElementById('config-id-selector');

/**
 * Set the grid templates for the rulers, and update the display
 *
 * @param {ScreenGrid} params
 */
const setRulerGridTemplates = (params) => {
  const { rows, columns } = params;

  let gridTemplate = '';
  for (let columnNum = 0; columnNum < columns.length; columnNum++) {
    gridTemplate += `${columns[columnNum]} `;
  }
  topRulerElement.style.gridTemplate = `auto/${gridTemplate}`;

  gridTemplate = '';
  for (let rowNum = 0; rowNum < rows.length; rowNum++) {
    gridTemplate += `${rows[rowNum]} `;
  }
  sideRulerElement.style.gridTemplate = `${gridTemplate}/auto`;
};

/**
 * Setup the list of config IDs below the editor
 *
 * @param {String[]} availableIDs
 * @param {String} currentID
 */
const setConfigIDList = () => {
  configListElement.innerHTML = '';

  const availableIDs = screen.getAvailableConfigIDs();
  const currentID = screen.getCurrentConfigID();

  if (!availableIDs.includes(currentID)) {
    throw new Error('Config ID not in list of available');
  }

  for (let IDNo = 0; IDNo < availableIDs.length; IDNo++) {
    const ID = availableIDs[IDNo];

    const optionElement = configListElement.appendChild(
      document.createElement('option')
    );

    optionElement.value = ID;
    optionElement.innerText = ID;
    if (ID === currentID) optionElement.selected = true;
  }
};

/**
 * Reset rulers from a new config
 *
 * @type {PostResetCallback}
 * @param {Object} config
 * @param {ScreenGrid} config.grid
 * @param {Screen?} alternateScreen
 */
const resetRulers = (config, alternateScreen = screen) => {
  const { rows, columns } = config.grid;

  topRulerElement.innerHTML = '';
  sideRulerElement.innerHTML = '';

  setConfigIDList();
  setRulerGridTemplates({ rows, columns });

  for (let columnNum = 0; columnNum < columns.length; columnNum++) {
    const divisionElement = topRulerElement.appendChild(
      document.createElement('div')
    );
    divisionElement.classList.add('ruler-division');
    divisionElement.style.gridArea = `1/${columnNum + 1}/2/${columnNum + 2}`; // eslint-disable-line no-magic-numbers
    const inputElement = divisionElement.appendChild(
      document.createElement('input')
    );
    inputElement.value = columns[columnNum];
    inputElement.addEventListener('input', (event) => {
      alternateScreen.updateGrid({
        column: columnNum,
        newSize: event.target.value
      });
      setRulerGridTemplates(config.grid);

      window.dirty = true;
    });
  }

  for (let rowNum = 0; rowNum < rows.length; rowNum++) {
    const divisionElement = sideRulerElement.appendChild(
      document.createElement('div')
    );
    divisionElement.classList.add('ruler-division');
    divisionElement.style.gridArea = `${rowNum + 1}/1/${rowNum + 2}/2`; // eslint-disable-line no-magic-numbers
    const inputElement = divisionElement.appendChild(
      document.createElement('input')
    );
    inputElement.value = rows[rowNum];
    inputElement.addEventListener('input', (event) => {
      alternateScreen.updateGrid({ row: rowNum, newSize: event.target.value });
      setRulerGridTemplates(config.grid);

      window.dirty = true;
    });
  }
};

/** @type {CounterEditHandler} */
const editHandler = (counter, params) => {
  if (params?.event === 'move' || params?.event === 'resize') {
    const newLayout = counter.updateLayout(params.event, params.direction);
    const grid = screen.getGrid();

    if (newLayout.location[0] + newLayout.size[0] >= grid.columns.length) {
      grid.columns.push('auto');
    } else if (newLayout.location[1] + newLayout.size[1] >= grid.rows.length) {
      grid.rows.push('auto');
    }

    screen.setGrid(grid);
    resetRulers({ grid });
  } else {
    return false;
  }

  window.dirty = true;

  return true;
};

screen = new Screen(HISTORY_LENGTH, editHandler, resetRulers);

document.getElementById('increment').addEventListener('click', () => {
  screen.incrementAll();
});
document.getElementById('undo').addEventListener('click', () => {
  screen.undo();
});
document.getElementById('reset').addEventListener('click', () => {
  screen.reset(HISTORY_LENGTH);
});
document.getElementById('save').addEventListener('click', () => {
  screen.saveChanges();
  window.dirty = false;
});
document.getElementById('exit').addEventListener('click', () => {
  const newURL = new URL('./', window.location);
  newURL.searchParams.set('configID', screen.getCurrentConfigID());
  window.location = newURL;
});
document
  .getElementById('config-id-selector')
  .addEventListener('change', (event) => {
    screen.switchConfig(event.target.value);
  });
document.getElementById('reset-all-configs').addEventListener('click', () => {
  screen.resetAllConfigs();
  screen.reset();
});

window.addEventListener('beforeunload', (event) => {
  if (window.dirty) {
    event.preventDefault(); // Prompt to save
  }
});
