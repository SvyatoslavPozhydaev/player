import { Media } from '@vidstack/react';
import {
  type MediaOrientationChangeEvent,
  type ScreenOrientationLockType,
  type ScreenOrientationType,
} from 'vidstack';

function MediaPlayer() {
  function onOrientationChange(event: MediaOrientationChangeEvent) {
    const { orientation, lock } = event.detail;
  }

  return <Media onOrientationChange={onOrientationChange}>{/* ... */}</Media>;
}
