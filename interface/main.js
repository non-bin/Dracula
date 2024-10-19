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
      position: [0, 0],
      size: [2, 1],
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

// eslint-disable-next-line id-length
const retIfNotSame = (a, b) => {
  if (a === b) {
    console.log(a, b, false);
    return false;
  }
  console.log(a, b);

  return a;
};

// https://stackoverflow.com/a/11381730 http://detectmobilebrowsers.com/
const mobileOrTabletCheck = () => {
  let check = false;
  /* eslint-disable */
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    ) {
      check = true;
    }
  })(navigator.userAgent || navigator.vendor || window.opera);
  /* eslint-enable */
  return check;
};

const updateCounterColor = (counter) => {
  counter.elements.main.style.setProperty(
    '--color',
    retIfNotSame(
      counter.phases?.[counter.state.phase].color || counter.color,
      window.screenColor
    ) || 'color-mix(in oklab, var(--screen-color), rgba(192, 192, 192) 37%)'
  );
};

const updateCounterMax = (counter) => {
  counter.state.max =
    counter.phases[counter.state.phase].max || counter.max || Infinity;
};

const increment = () => {
  for (const counterName in counters) {
    if (Object.hasOwn(counters, counterName)) {
      const counter = counters[counterName];
      const valueElement = counter.elements.value;
      const phaseElement = counter.elements.phase;
      const maxElement = counter.elements.max;

      counter.state.value++;

      if (!counter.state.max || counter.state.value <= counter.state.max) {
        // No max, or haven't reached it yet
        valueElement.textContent = counter.state.value;
        continue;
      }

      counter.state.value = 1;

      if (!counter.phases) {
        valueElement.textContent = counter.state.value;
        continue;
      }

      counter.state.phase++;

      if (counter.state.phase >= counter.phases.length) {
        counter.state.phase = 0;
      }

      updateCounterColor(counter);
      updateCounterMax(counter);
      phaseElement.textContent = counter.phases[counter.state.phase].name;
      maxElement.textContent = `/${counter.state.max}`;

      valueElement.textContent = counter.state.value;
    }
  }
};

const addCounter = (screen, counterID, counter) => {
  counter.state = { value: 0 };
  counter.elements = {};

  const mainElement = document.createElement('div');
  mainElement.className = 'counter';
  if (counter.position) {
    mainElement.classList.add(counter.position);
  }
  counter.elements.main = screen.appendChild(mainElement);

  const nameElement = document.createElement('div');
  nameElement.classList.add('counter_text', 'counter_name');
  nameElement.textContent = counter.name;
  counter.elements.name = mainElement.appendChild(nameElement);

  if (counter.phases) {
    counter.state.phase = 0;

    const phaseElement = document.createElement('div');
    phaseElement.classList.add('counter_text', 'counter_phase');
    phaseElement.textContent = counter.phases[0].name;
    counter.elements.phase = mainElement.appendChild(phaseElement);
  }

  const valueElement = document.createElement('div');
  valueElement.classList.add('counter_text', 'counter_value');
  valueElement.textContent = 0;
  counter.elements.value = mainElement.appendChild(valueElement);

  if (counter.max || counter.phases?.[0]?.max) {
    updateCounterMax(counter);
    const maxElement = document.createElement('div');
    maxElement.classList.add('counter_text', 'counter_max');
    maxElement.textContent = `/${counter.state.max}`;
    counter.elements.max = mainElement.appendChild(maxElement);
  }

  updateCounterColor(counter);

  return counter;
};

const setup = () => {
  try {
    if (mobileOrTabletCheck()) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        /* Safari */
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        /* IE11 */
        document.documentElement.msRequestFullscreen();
      } else {
        console.log('No fullscreen');
      }
    }

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
        counters[counterID] = addCounter(
          screen,
          counterID,
          config.counters[counterID]
        );
      }
    }
  } catch (error) {
    document.getElementById('error').innerText = error.message;
    console.error(error);
  }
};

document.getElementById('increment').addEventListener('click', increment);
document.addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    event.preventDefault();
    event.stopPropagation();
    increment();
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
