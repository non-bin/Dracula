const counters = {};
const defaultConfigs = {
  counters: {
    Phase: {
      position: 'top',
      phases: [
        { name: 'Hem', max: 30 },
        { name: 'Ankle', max: 50 },
        { name: 'Heel Decrease', max: 15 },
        { name: 'Heal Increase', max: 15 },
        { name: 'Foot', max: 60 },
        { name: 'Toe Decrease', max: 15 },
        { name: 'Toe Increase', max: 15 },
        { name: 'Waste Yarn', max: Infinity }
      ]
    },
    Total: {
      position: 'bottom-left'
    },
    Colour: {
      position: 'bottom-right',
      phases: [{ name: 'Red' }, { name: 'Green' }, { name: 'black', max: 2 }],
      max: 3
    }
  }
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

      counter.state.max =
        counter.phases[counter.state.phase].max || counter.max || Infinity;
      phaseElement.textContent = counter.phases[counter.state.phase].name;
      maxElement.textContent = `/${counter.state.max}`;

      valueElement.textContent = counter.state.value;
    }
  }
};

const addCounter = (screen, counterName, config) => {
  counters[counterName] = config;
  config.state = { value: 0 };
  config.elements = {};

  const mainElement = document.createElement('div');
  mainElement.className = 'counter';
  if (config.position) {
    mainElement.classList.add(config.position);
  }
  config.elements.main = screen.appendChild(mainElement);

  const nameElement = document.createElement('div');
  nameElement.className = 'counter__name';
  nameElement.textContent = counterName;
  config.elements.name = mainElement.appendChild(nameElement);

  if (config.phases) {
    config.state.phase = 0;

    const phaseElement = document.createElement('div');
    phaseElement.className = 'counter__phase';
    phaseElement.textContent = config.phases[0].name;
    config.elements.phase = mainElement.appendChild(phaseElement);
  }

  const valueElement = document.createElement('div');
  valueElement.className = 'counter__value';
  valueElement.textContent = 0;
  config.elements.value = mainElement.appendChild(valueElement);

  // if (config.max) { inner += `<div class="counter__max">/${config.max}</div>` }
  if (config.max || config.phases?.[0]?.max) {
    config.state.max = config.phases?.[0].max || config.max || 'Inf';
    const maxElement = document.createElement('div');
    maxElement.className = 'counter__max';
    maxElement.textContent = `/${config.state.max}`;
    config.elements.max = mainElement.appendChild(maxElement);
  }

  return config;
};

const setup = () => {
  try {
    const configElement = document.getElementById('config');
    const config = JSON.parse(configElement.value);

    const screen = document.getElementById('screen');
    screen.innerHTML = '';

    for (const counterName in config.counters) {
      if (Object.hasOwn(config.counters, counterName)) {
        addCounter(screen, counterName, config.counters[counterName]);
      }
    }
  } catch (error) {
    document.getElementById('error').innerText = error.message;
    console.dir(error.message);
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
