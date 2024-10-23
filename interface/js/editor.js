import Screen from './screen.js';

const HISTORY_LENGTH = 500;

const sideRulerElement = document.getElementById('side-ruler');
const topRulerElement = document.getElementById('top-ruler');

const editHandler = (counter) => {
  console.log(counter);
};

const setRulerGridTemplates = ({ rows, columns }) => {
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

const resetRulers = (screen, config) => {
  const { rows, columns } = config.grid;

  topRulerElement.innerHTML = '';
  sideRulerElement.innerHTML = '';

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
      screen.updateGrid({ column: columnNum, newSize: event.target.value });
      setRulerGridTemplates(config.grid);
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
      screen.updateGrid({ row: rowNum, newSize: event.target.value });
      setRulerGridTemplates(config.grid);
    });
  }
};

const screen = new Screen(HISTORY_LENGTH, editHandler, resetRulers);

document.getElementById('increment').addEventListener('click', () => {
  screen.incrementAll();
});
document.getElementById('reset').addEventListener('click', () => {
  screen.resetCounters(HISTORY_LENGTH);
});
