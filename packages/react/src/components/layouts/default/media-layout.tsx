import * as React from 'react';

import { useSignal } from 'maverick.js/react';
import { isBoolean } from 'maverick.js/std';
import {
  type DefaultLayoutTranslations,
  type MediaPlayerQuery,
  type MediaStreamType,
  type ThumbnailSrc,
} from 'vidstack';

import { useMediaContext } from '../../../hooks/use-media-context';
import { useMediaState } from '../../../hooks/use-media-state';
import { createComputed } from '../../../hooks/use-signals';
import type { PrimitivePropsWithRef } from '../../primitives/nodes';
import { DefaultLayoutContext } from './context';
import type { DefaultLayoutIcons } from './icons';

/* -------------------------------------------------------------------------------------------------
 * DefaultMediaLayout
 * -----------------------------------------------------------------------------------------------*/

export interface DefaultLayoutProps<Slots = unknown> extends PrimitivePropsWithRef<'div'> {
  children?: React.ReactNode;
  /**
   * The icons to be rendered and displayed inside the layout.
   */
  icons: DefaultLayoutIcons;
  /**
   * Specifies the number of milliseconds to wait before tooltips are visible after interacting
   * with a control.
   *
   * @defaultValue 700
   */
  showTooltipDelay?: number;
  /**
   * Specifies the number of milliseconds to wait before menus are visible after opening them.
   *
   * @defaultValue 0
   */
  showMenuDelay?: number;
  /**
   * Whether the bitrate should be hidden in the settings quality menu next to each option.
   *
   * @defaultValue false
   */
  hideQualityBitrate?: boolean;
  /**
   * Determines when the small (e.g., mobile) UI should be displayed.
   *
   * @defaultValue `({ width, height }) => width < 576 || height < 380`
   */
  smallLayoutWhen?: boolean | MediaPlayerQuery;
  /**
   * The thumbnails resource.
   *
   * @see {@link https://www.vidstack.io/docs/wc/player/core-concepts/loading#thumbnails}
   */
  thumbnails?: ThumbnailSrc;
  /**
   * Translation map from english to your desired language for words used throughout the layout.
   */
  translations?: Partial<DefaultLayoutTranslations> | null;
  /**
   * Specifies whether menu buttons should be placed in the top or bottom controls group. This
   * only applies to the large video layout.
   */
  menuGroup?: 'top' | 'bottom';
  /**
   * Whether modal menus should be disabled when the small layout is active. A modal menu is
   * a floating panel that floats up from the bottom of the screen (outside of the player). It's
   * enabled by default as it provides a better user experience for touch devices.
   */
  noModal?: boolean;
  /**
   * Whether to disable scrubbing by touch swiping left or right on the player canvas.
   */
  noScrubGesture?: boolean;
  /**
   * The minimum width of the slider to start displaying slider chapters when available.
   */
  sliderChaptersMinWidth?: number;
  /**
   * Whether the time slider should be disabled.
   */
  disableTimeSlider?: boolean;
  /**
   * Whether all gestures such as press to play or seek should not be active.
   */
  noGestures?: boolean;
  /**
   * Whether keyboard actions should not be displayed.
   */
  noKeyboardActionDisplay?: boolean;
  /**
   * The playback rate options to be displayed in the settings menu.
   */
  playbackRates?: number[];
  /**
   * The number of seconds to seek forward or backward when pressing the seek button or using
   * keyboard shortcuts.
   */
  seekStep?: number;
  /**
   * Provide additional content to be inserted in specific positions.
   */
  slots?: Slots;
}

export interface CreateDefaultMediaLayout {
  type: 'audio' | 'video';
  smLayoutWhen: MediaPlayerQuery;
  renderLayout: (props: {
    streamType: MediaStreamType;
    isLoadLayout: boolean;
    isSmallLayout: boolean;
  }) => React.ReactNode;
}

export function createDefaultMediaLayout({
  type,
  smLayoutWhen,
  renderLayout,
}: CreateDefaultMediaLayout) {
  const Layout = React.forwardRef<HTMLDivElement, DefaultLayoutProps>(
    (
      {
        children,
        className,
        disableTimeSlider = false,
        hideQualityBitrate = false,
        icons,
        menuGroup = 'bottom',
        noGestures = false,
        noKeyboardActionDisplay = false,
        noModal = false,
        noScrubGesture,
        playbackRates,
        seekStep = 10,
        showMenuDelay,
        showTooltipDelay = 700,
        sliderChaptersMinWidth = 325,
        slots,
        smallLayoutWhen = smLayoutWhen,
        thumbnails = null,
        translations,
        ...props
      },
      forwardRef,
    ) => {
      const media = useMediaContext(),
        $load = useSignal(media.$props.load),
        $canLoad = useMediaState('canLoad'),
        $viewType = useMediaState('viewType'),
        $streamType = useMediaState('streamType'),
        $smallWhen = createComputed(() => {
          return isBoolean(smallLayoutWhen) ? smallLayoutWhen : smallLayoutWhen(media.player.state);
        }, [smallLayoutWhen]),
        isMatch = $viewType === type,
        isSmallLayout = $smallWhen(),
        isForcedLayout = isBoolean(smallLayoutWhen),
        isLoadLayout = $load === 'play' && !$canLoad,
        canRender = $canLoad || isForcedLayout || isLoadLayout;

      useSignal($smallWhen);

      return (
        <div
          {...props}
          className={`vds-${type}-layout` + (className ? ` ${className}` : '')}
          data-match={isMatch ? '' : null}
          data-size={isSmallLayout ? 'sm' : null}
          data-no-scrub-gesture={noScrubGesture ? '' : null}
          ref={forwardRef}
        >
          {canRender && isMatch ? (
            <DefaultLayoutContext.Provider
              value={{
                disableTimeSlider,
                hideQualityBitrate,
                icons: icons,
                isSmallLayout,
                menuGroup,
                noGestures,
                noKeyboardActionDisplay,
                noModal,
                noScrubGesture,
                showMenuDelay,
                showTooltipDelay,
                sliderChaptersMinWidth,
                slots,
                seekStep,
                playbackRates,
                thumbnails,
                translations,
              }}
            >
              {renderLayout({ streamType: $streamType, isSmallLayout, isLoadLayout })}
              {children}
            </DefaultLayoutContext.Provider>
          ) : null}
        </div>
      );
    },
  );

  Layout.displayName = 'DefaultMediaLayout';
  return Layout;
}
