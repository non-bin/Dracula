import * as utils from './utilities.js';
import Screen from './screen.js';

const HISTORY_LENGTH = 500;
const LONG_TOUCH_DURATION = 500; // ms
const SPEED_MODE_INTERVAL = 50; // ms

const screen = new Screen(HISTORY_LENGTH);

let longTouchTimer;
let speedModeTimer;
let touchPosition;

const longTouch = () => {
  const positionAsProportion = utils.getPositionAsProportion(touchPosition);

  if (positionAsProportion[0] < 0.5) {
    screen.reset();
  } else {
    speedModeTimer = setInterval(
      () => screen.incrementAll(),
      SPEED_MODE_INTERVAL
    );
  }

  longTouchTimer = null;
};

const shortTouch = () => {
  const positionAsProportion = utils.getPositionAsProportion(touchPosition);

  if (positionAsProportion[0] < 0.5) {
    screen.undo();
  } else {
    screen.incrementAll();
  }
};

/**
 * @param {TouchEvent} touchEvent
 */
const touchStart = (touchEvent) => {
  touchEvent.preventDefault(); // Prevent the browser from processing emulated mouse events

  if (Screen.getPreference('mobileFullscreen')) {
    utils.requestFullscreen();
  }

  const touch = touchEvent.targetTouches.item(0);
  touchPosition = [touch.clientX, touch.clientY];

  longTouchTimer = setTimeout(longTouch, LONG_TOUCH_DURATION, touchEvent);
};

/**
 * @param {TouchEvent} touchEvent
 */
const touchEnd = (touchEvent) => {
  if (longTouchTimer) {
    // Lifted finger before long touch
    clearTimeout(longTouchTimer);
    longTouchTimer = null;

    shortTouch(touchEvent);
  } /* else {
    // Lifted finger after long touch
  } */

  if (speedModeTimer) {
    clearInterval(speedModeTimer);
    speedModeTimer = null;
  }
};

const touchMove = () => {
  // Not used, but don't cancel the event
};

const touchCancel = () => {
  if (longTouchTimer) {
    clearTimeout(longTouchTimer);
    longTouchTimer = null;
  }
  if (speedModeTimer) {
    clearInterval(speedModeTimer);
    speedModeTimer = null;
  }
};

if (utils.mobileOrTabletCheck()) {
  const touchCatcherElement = document.getElementById('touchCatcher');
  touchCatcherElement.style.display = 'block';
  touchCatcherElement.addEventListener('touchstart', touchStart, false);
  touchCatcherElement.addEventListener('touchmove', touchMove, false);
  touchCatcherElement.addEventListener('touchcancel', touchCancel, false);
  touchCatcherElement.addEventListener('touchend', touchEnd, false);
}
