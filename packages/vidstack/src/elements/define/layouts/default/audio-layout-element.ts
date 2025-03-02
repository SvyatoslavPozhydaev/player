import { html } from 'lit-html';
import { effect, onDispose, signal } from 'maverick.js';
import { Host, type Attributes } from 'maverick.js/element';
import { listenEvent, setAttribute } from 'maverick.js/std';

import { DefaultAudioLayout } from '../../../../components/layouts/default/audio-layout';
import type { DefaultLayoutProps } from '../../../../components/layouts/default/props';
import type { MediaContext } from '../../../../core';
import { useMediaContext } from '../../../../core/api/media-context';
import { $signal } from '../../../lit/directives/signal';
import { LitElement, type LitRenderer } from '../../../lit/lit-element';
import { SlotManager } from '../slot-manager';
import { DefaultAudioLayout as Layout } from './audio-layout';
import { DefaultLayoutIconsLoader } from './icons-loader';
import { createMenuContainer } from './shared-layout';

/**
 * @docs {@link https://www.vidstack.io/docs/wc/player/components/layouts/default-layout}
 * @example
 * ```html
 * <media-player>
 *   <media-provider></media-provider>
 *   <media-audio-layout></media-audio-layout>
 * </media-player>
 * ```
 */
export class MediaAudioLayoutElement
  extends Host(LitElement, DefaultAudioLayout)
  implements LitRenderer
{
  static tagName = 'media-audio-layout';

  static override attrs: Attributes<DefaultLayoutProps> = {
    smallWhen: {
      converter(value) {
        return value !== 'never' && !!value;
      },
    },
  };

  private _media!: MediaContext;
  private _scrubbing = signal(false);

  protected onSetup() {
    // Avoid memory leaks if `keepAlive` is true. The DOM will re-render regardless.
    this.forwardKeepAlive = false;

    this._media = useMediaContext();

    this.classList.add('vds-audio-layout');
    this.menuContainer = createMenuContainer('vds-audio-layout');

    effect(() => {
      if (!this.menuContainer) return;
      setAttribute(this.menuContainer, 'data-size', this.isSmallLayout && 'sm');
    });

    const { pointer } = this._media.$state;
    effect(() => {
      if (pointer() !== 'coarse') return;
      effect(this._watchScrubbing.bind(this));
    });

    onDispose(() => this.menuContainer?.remove());
  }

  protected onConnect() {
    this._media.player.el?.setAttribute('data-layout', 'audio');
    onDispose(() => this._media.player.el?.removeAttribute('data-layout'));

    effect(() => {
      if (this.$props.customIcons()) {
        new SlotManager(this).connect();
      } else {
        new DefaultLayoutIconsLoader(this).connect();
      }
    });
  }

  render() {
    return html`${$signal(this._render.bind(this))}`;
  }

  private _render() {
    return this.isMatch ? Layout() : null;
  }

  private _watchScrubbing() {
    if (!this._scrubbing()) {
      listenEvent(this, 'pointerdown', this._onStartScrubbing.bind(this), { capture: true });
      return;
    }

    listenEvent(this, 'pointerdown', (e) => e.stopPropagation());
    listenEvent(window, 'pointerdown', this._onStopScrubbing.bind(this));
  }

  private _onStartScrubbing(event: Event) {
    const { target } = event,
      hasTimeSlider = !!(target instanceof HTMLElement && target.closest('.vds-time-slider'));

    if (!hasTimeSlider) return;

    event.stopImmediatePropagation();
    this.setAttribute('data-scrubbing', '');
    this._scrubbing.set(true);
  }

  private _onStopScrubbing() {
    this._scrubbing.set(false);
    this.removeAttribute('data-scrubbing');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'media-audio-layout': MediaAudioLayoutElement;
  }
}
