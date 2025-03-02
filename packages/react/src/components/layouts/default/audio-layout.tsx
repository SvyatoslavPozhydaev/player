import * as React from 'react';

import { useSignal } from 'maverick.js/react';
import { listenEvent, toggleClass } from 'maverick.js/std';

import { useChapterTitle } from '../../../hooks/use-chapter-title';
import {
  useActive,
  useMouseEnter,
  useRectCSSVars,
  useResizeObserver,
  useTransitionActive,
} from '../../../hooks/use-dom';
import { useMediaContext } from '../../../hooks/use-media-context';
import { useMediaState } from '../../../hooks/use-media-state';
import { createComputed } from '../../../hooks/use-signals';
import { Captions } from '../../ui/captions';
import * as Controls from '../../ui/controls';
import { useLayoutName } from '../utils';
import { DefaultLayoutContext, i18n, useDefaultLayoutContext } from './context';
import { createDefaultMediaLayout, type DefaultLayoutProps } from './media-layout';
import {
  DefaultCaptionButton,
  DefaultChaptersMenu,
  DefaultControlsSpacer,
  DefaultMuteButton,
  DefaultPlayButton,
  DefaultSeekButton,
  DefaultSettingsMenu,
  DefaultTimeInvert,
  DefaultTimeSlider,
  DefaultVolumeSlider,
} from './shared-layout';
import {
  slot,
  useDefaultAudioLayoutSlots,
  type DefaultAudioLayoutSlots,
  type DefaultLayoutMenuSlotName,
  type Slots,
} from './slots';

/* -------------------------------------------------------------------------------------------------
 * DefaultAudioLayout
 * -----------------------------------------------------------------------------------------------*/

const MediaLayout = createDefaultMediaLayout({
  type: 'audio',
  smLayoutWhen({ width }) {
    return width < 576;
  },
  renderLayout: () => <AudioLayout />,
});

export interface DefaultAudioLayoutProps extends DefaultLayoutProps<DefaultAudioLayoutSlots> {}

/**
 * The audio layout is our production-ready UI that's displayed when the media view type is set to
 * 'audio'. It includes support for audio tracks, slider chapters, captions, live streams
 * and more out of the box.
 *
 * @attr data-match - Whether this layout is being used.
 * @attr data-size - The active layout size.
 * @example
 * ```tsx
 * <MediaPlayer src="audio.mp3">
 *   <MediaProvider />
 *   <DefaultAudioLayout icons={defaultLayoutIcons} />
 * </MediaPlayer>
 * ```
 */
function DefaultAudioLayout(props: DefaultAudioLayoutProps) {
  const [scrubbing, setScrubbing] = React.useState(false),
    $pointer = useMediaState('pointer');

  useLayoutName('audio');

  const onStartScrubbing = React.useCallback((event: React.SyntheticEvent) => {
    const { target } = event,
      hasTimeSlider = !!(target instanceof HTMLElement && target.closest('.vds-time-slider'));
    if (!hasTimeSlider) return;
    event.nativeEvent.stopImmediatePropagation();
    setScrubbing(true);
  }, []);

  const onStopScrubbing = React.useCallback(() => {
    setScrubbing(false);
  }, []);

  React.useEffect(() => {
    if (scrubbing) return listenEvent(window, 'pointerdown', onStopScrubbing);
  }, [scrubbing, onStopScrubbing]);

  return (
    <MediaLayout
      {...props}
      data-scrubbing={scrubbing ? '' : null}
      onPointerDown={scrubbing ? (e) => e.stopPropagation() : undefined}
      onPointerDownCapture={$pointer === 'coarse' && !scrubbing ? onStartScrubbing : undefined}
    />
  );
}

DefaultAudioLayout.displayName = 'DefaultAudioLayout';
export { DefaultAudioLayout };

/* -------------------------------------------------------------------------------------------------
 * AudioLayout
 * -----------------------------------------------------------------------------------------------*/

function AudioLayout() {
  const slots = useDefaultAudioLayoutSlots();
  return (
    <>
      <Captions className="vds-captions" />
      <Controls.Root className="vds-controls">
        <Controls.Group className="vds-controls-group">
          {slot(slots, 'seekBackwardButton', <DefaultSeekButton backward tooltip="top start" />)}
          {slot(slots, 'playButton', <DefaultPlayButton tooltip="top center" />)}
          {slot(slots, 'seekForwardButton', <DefaultSeekButton tooltip="top center" />)}
          <DefaultAudioTitle />
          {slot(slots, 'timeSlider', <DefaultTimeSlider />)}
          <DefaultTimeInvert />
          <DefaultAudioVolume />
          {slot(slots, 'captionButton', <DefaultCaptionButton tooltip="top center" />)}
          <DefaultAudioMenus slots={slots} />
        </Controls.Group>
      </Controls.Root>
    </>
  );
}

AudioLayout.displayName = 'AudioLayout';

/* -------------------------------------------------------------------------------------------------
 * DefaultAudioMenus
 * -----------------------------------------------------------------------------------------------*/

function DefaultAudioMenus({ slots }: { slots?: Slots<DefaultLayoutMenuSlotName> }) {
  const { isSmallLayout, noModal } = React.useContext(DefaultLayoutContext),
    placement = noModal ? 'top end' : !isSmallLayout ? 'top end' : null;
  return (
    <>
      {slot(
        slots,
        'chaptersMenu',
        <DefaultChaptersMenu tooltip="top" placement={placement} portalClass="vds-audio-layout" />,
      )}
      {slot(
        slots,
        'settingsMenu',
        <DefaultSettingsMenu
          tooltip="top end"
          placement={placement}
          portalClass="vds-audio-layout"
          slots={slots}
        />,
      )}
    </>
  );
}

DefaultAudioMenus.displayName = 'DefaultAudioMenus';

/* -------------------------------------------------------------------------------------------------
 * DefaultAudioTitle
 * -----------------------------------------------------------------------------------------------*/

function DefaultAudioTitle() {
  const [rootEl, setRootEl] = React.useState<HTMLElement | null>(null),
    media = useMediaContext(),
    { translations } = useDefaultLayoutContext(),
    [isTextOverflowing, setIsTextOverflowing] = React.useState(false);

  const isContinued = createComputed(() => {
    const { started, currentTime } = media.$state;
    return started() || currentTime() > 0;
  });

  const $title = useSignal(
    createComputed(() => {
      const { title, ended } = media.$state;
      if (!title()) return '';
      const word = ended() ? 'Replay' : isContinued() ? 'Continue' : 'Play';
      return `${i18n(translations, word)}: ${title()}`;
    }),
  );

  const chapterTitle = useChapterTitle(),
    $isContinued = useSignal(isContinued),
    $chapterTitle = $isContinued ? chapterTitle : '',
    isTransitionActive = useTransitionActive(rootEl);

  React.useEffect(() => {
    if (isTransitionActive && document.activeElement === document.body) {
      media.player.el?.focus();
    }
  }, []);

  const onResize = React.useCallback(() => {
    const el = rootEl,
      isOverflowing = !!el && !isTransitionActive && el.clientWidth < el.children[0]!.clientWidth;
    if (el) toggleClass(el, 'vds-marquee', isOverflowing);
    setIsTextOverflowing(isOverflowing);
  }, [rootEl, isTransitionActive]);

  useResizeObserver(rootEl, onResize);

  return $title ? (
    <span className="vds-title" title={$title} ref={setRootEl}>
      <AudioTitle title={$title} chapterTitle={$chapterTitle} />
      {isTextOverflowing && !isTransitionActive ? (
        <AudioTitle title={$title} chapterTitle={$chapterTitle} />
      ) : null}
    </span>
  ) : (
    <DefaultControlsSpacer />
  );
}

DefaultAudioTitle.displayName = 'DefaultAudioTitle';

function AudioTitle({ title, chapterTitle }: { title: string; chapterTitle: string }) {
  const slots = useDefaultAudioLayoutSlots();
  return (
    <span className="vds-title-text">
      {slot(slots, 'title', title)}
      {slot(slots, 'chapterTitle', <span className="vds-chapter-title">{chapterTitle}</span>)}
    </span>
  );
}

AudioTitle.displayName = 'AudioTitle';

/* -------------------------------------------------------------------------------------------------
 * DefaultAudioVolume
 * -----------------------------------------------------------------------------------------------*/

function DefaultAudioVolume() {
  const $pointer = useMediaState('pointer'),
    $muted = useMediaState('muted'),
    [rootEl, setRootEl] = React.useState<HTMLElement | null>(null),
    [triggerEl, setTriggerEl] = React.useState<HTMLElement | null>(null),
    [popperEl, setPopperEl] = React.useState<HTMLDivElement | null>(null),
    isRootActive = useActive(rootEl),
    hasMouseEnteredTrigger = useMouseEnter(triggerEl),
    slots = useDefaultAudioLayoutSlots();

  useRectCSSVars(rootEl, hasMouseEnteredTrigger ? triggerEl : null, 'trigger');
  useRectCSSVars(rootEl, hasMouseEnteredTrigger ? popperEl : null, 'popper');

  return $pointer === 'coarse' && !$muted ? null : (
    <div className="vds-volume" data-active={isRootActive ? '' : null} ref={setRootEl}>
      {slot(slots, 'muteButton', <DefaultMuteButton tooltip="top center" ref={setTriggerEl} />)}
      <div className="vds-volume-popup" ref={setPopperEl}>
        {slot(slots, 'volumeSlider', <DefaultVolumeSlider orientation="vertical" />)}
      </div>
    </div>
  );
}

DefaultAudioVolume.displayName = 'DefaultAudioVolume';
