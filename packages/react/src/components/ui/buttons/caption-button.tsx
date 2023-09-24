import * as React from 'react';

import { composeRefs, createReactComponent, type ReactElementProps } from 'maverick.js/react';

import { CaptionButtonInstance, MuteButtonInstance } from '../../primitives/instances';
import { Primitive } from '../../primitives/nodes';

/* -------------------------------------------------------------------------------------------------
 * CaptionButton
 * -----------------------------------------------------------------------------------------------*/

const CaptionButtonBridge = createReactComponent(CaptionButtonInstance);

export interface CaptionButtonProps
  extends ReactElementProps<MuteButtonInstance, HTMLButtonElement> {
  asChild?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * A button for toggling the showing state of the captions.
 *
 * @docs {@link https://www.vidstack.io/docs/player/components/buttons/caption-button}
 */
const CaptionButton = React.forwardRef<HTMLButtonElement, CaptionButtonProps>(
  ({ children, ...props }, forwardRef) => {
    return (
      <CaptionButtonBridge {...(props as Omit<CaptionButtonProps, 'ref'>)}>
        {(props) => (
          <Primitive.button type="button" {...props} ref={composeRefs(props.ref, forwardRef)}>
            {children}
          </Primitive.button>
        )}
      </CaptionButtonBridge>
    );
  },
);

CaptionButton.displayName = 'CaptionButton';
export { CaptionButton };
