import airplay from 'media-icons/dist/icons/airplay.js';
import menuArrowLeft from 'media-icons/dist/icons/arrow-left.js';
import chapters from 'media-icons/dist/icons/chapters.js';
import menuArrowRight from 'media-icons/dist/icons/chevron-right.js';
import googleCast from 'media-icons/dist/icons/chromecast.js';
import ccOn from 'media-icons/dist/icons/closed-captions-on.js';
import ccOff from 'media-icons/dist/icons/closed-captions.js';
import menuCaptions from 'media-icons/dist/icons/closed-captions.js';
import fastBackward from 'media-icons/dist/icons/fast-backward.js';
import fastForward from 'media-icons/dist/icons/fast-forward.js';
import fsExit from 'media-icons/dist/icons/fullscreen-exit.js';
import fsEnter from 'media-icons/dist/icons/fullscreen.js';
import menuAudio from 'media-icons/dist/icons/music.js';
import mute from 'media-icons/dist/icons/mute.js';
import menuSpeed from 'media-icons/dist/icons/odometer.js';
import pause from 'media-icons/dist/icons/pause.js';
import pipExit from 'media-icons/dist/icons/picture-in-picture-exit.js';
import pipEnter from 'media-icons/dist/icons/picture-in-picture.js';
import play from 'media-icons/dist/icons/play.js';
import replay from 'media-icons/dist/icons/replay.js';
import seekBackward from 'media-icons/dist/icons/seek-backward-10.js';
import seekForward from 'media-icons/dist/icons/seek-forward-10.js';
import menuQuality from 'media-icons/dist/icons/settings-menu.js';
import settings from 'media-icons/dist/icons/settings.js';
import volumeHigh from 'media-icons/dist/icons/volume-high.js';
import volumeLow from 'media-icons/dist/icons/volume-low.js';

const menuFont = `<path d="M22.6667 10.6667H26.6667V26.6667H28V28H22.6667V26.6667H24V22.6667H18.6667L16.6667 26.6667H18.6667V28H13.3333V26.6667H14.6667L22.6667 10.6667ZM24 12L19.3333 21.3333H24V12ZM6.66667 4H13.3333C14.8133 4 16 5.18667 16 6.66667V21.3333H12V14.6667H8V21.3333H4V6.66667C4 5.18667 5.18667 4 6.66667 4ZM8 6.66667V12H12V6.66667H8Z" fill="currentColor" />`;

export const icons = {
  airplay,
  play,
  pause,
  replay,
  mute,
  'google-cast': googleCast,
  'volume-low': volumeLow,
  'volume-high': volumeHigh,
  'cc-on': ccOn,
  'cc-off': ccOff,
  'pip-enter': pipEnter,
  'pip-exit': pipExit,
  'fs-enter': fsEnter,
  'fs-exit': fsExit,
  'seek-forward': seekForward,
  'seek-backward': seekBackward,
  'menu-chapters': chapters,
  'menu-settings': settings,
  'menu-arrow-left': menuArrowLeft,
  'menu-arrow-right': menuArrowRight,
  'menu-audio': menuAudio,
  'menu-speed': menuSpeed,
  'menu-quality': menuQuality,
  'menu-captions': menuCaptions,
  'menu-font': menuFont,
  'kb-play': play,
  'kb-pause': pause,
  'kb-mute': mute,
  'kb-volume-up': volumeHigh,
  'kb-volume-down': volumeLow,
  'kb-fs-enter': fsEnter,
  'kb-fs-exit': fsExit,
  'kb-pip-enter': pipEnter,
  'kb-pip-exit': pipExit,
  'kb-cc-on': ccOn,
  'kb-cc-off': ccOff,
  'kb-seek-forward': fastForward,
  'kb-seek-backward': fastBackward,
};
