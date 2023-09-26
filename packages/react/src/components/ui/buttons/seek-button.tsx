import * as React from 'react';

import { composeRefs, createReactComponent, type ReactElementProps } from 'maverick.js/react';

import { SeekButtonInstance } from '../../primitives/instances';
import { Primitive } from '../../primitives/nodes';

/* -------------------------------------------------------------------------------------------------
 * SeekButton
 * -----------------------------------------------------------------------------------------------*/

const SeekButtonBridge = createReactComponent(SeekButtonInstance);

export interface SeekButtonProps extends ReactElementProps<SeekButtonInstance, HTMLButtonElement> {
  asChild?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * A button for seeking the current media playback forwards or backwards by a specified amount.
 *
 * @docs {@link https://www.vidstack.io/docs/player/components/buttons/seek-button}
 */
const SeekButton = React.forwardRef<HTMLButtonElement, SeekButtonProps>(
  ({ children, ...props }, forwardRef) => {
    return (
      <SeekButtonBridge {...(props as Omit<SeekButtonProps, 'ref'>)}>
        {(props) => (
          <Primitive.button type="button" {...props} ref={composeRefs(props.ref, forwardRef)}>
            {children}
          </Primitive.button>
        )}
      </SeekButtonBridge>
    );
  },
);

SeekButton.displayName = 'SeekButton';
export { SeekButton };