/**
 * @type {import('./screen.js').ScreenConfig[]}
 */
export default {
  minimal: {
    counters: {
      main: {}
    }
  },
  basic: {
    grid: { rows: ['auto'], columns: ['auto'] },
    color: 'black',
    counters: {
      phase: {
        name: 'Phase',
        max: 15,
        phases: [
          { name: 'Hem', max: 30 },
          { name: 'Ankle', max: 50 },
          { name: 'Heel Decrease' },
          { name: 'Heal Increase' },
          { name: 'Foot', max: 60 },
          { name: 'Toe Decrease' },
          { name: 'Toe Increase' },
          { name: 'Waste Yarn', max: Infinity }
        ]
      }
    }
  },
  colours: {
    grid: { rows: ['60%', 'auto'], columns: ['40%', 'auto'] },
    color: 'black',
    counters: {
      phase: {
        name: 'Phase',
        layout: {
          location: [0, 0],
          size: [1, 0]
        },
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
        layout: {
          location: [0, 1],
          size: [0, 0]
        }
      },
      colour: {
        name: 'Colour',
        layout: {
          location: [1, 1],
          size: [0, 0]
        },
        phases: [
          { name: 'Red', color: 'red' },
          { name: 'Green', color: 'green' },
          { name: 'Black', color: 'black', max: 2 }
        ],
        max: 3
      }
    }
  }
};
