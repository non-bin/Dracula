import * as utils from './utilities.js';
import Screen from './screen.js';

const HISTORY_LENGTH = 500;
const LONG_TOUCH_DURATION = 500; // ms

const screen = new Screen(HISTORY_LENGTH);

let longTouchTimer;
let touchPosition;

/**
 *
 * @param {TouchEvent} touchEvent
 */
const longTouch = (touchEvent) => {
  console.log('longTouch', touchPosition);

  longTouchTimer = null;
};

/**
 *
 * @param {TouchEvent} touchEvent
 */
const shortTouch = (touchEvent) => {
  console.log('shortTouch', touchPosition);

  if (Screen.getPreference('mobileFullscreen')) {
    utils.requestFullscreen();
  }
};

/**
 * @param {TouchEvent} touchEvent
 */
const touchStart = (touchEvent) => {
  const touch = touchEvent.targetTouches.item(0);
  touchPosition = [touch.clientX, touch.clientY];

  touchEvent.preventDefault(); // Prevent the browser from processing emulated mouse events
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
};

const touchMove = () => {
  // Not used, but don't cancel the event
};

const touchCancel = () => {
  if (longTouchTimer) {
    clearTimeout(longTouchTimer);
    longTouchTimer = null;
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

// Expose the screen object to the global scope for debugging
// URGENT: Remove this before production
window.screen = screen;
window.Screen = Screen;
