import {
  walkComponentDocs,
  type ComponentMeta,
  type CustomElementMeta,
  type EventMeta,
  type MethodMeta,
  type PropMeta,
  type ReactCallbackMeta,
  type ReactComponentMeta,
  type ReactPropMeta,
} from '@maverick-js/cli/analyze';
import reactAnalysis from '@vidstack/react/analyze.json';
import MarkdownIt from 'markdown-it';
import wcAnalysis from 'vidstack/analyze.json';

import { kebabToPascalCase } from '../utils/string';

const parser = new MarkdownIt({ html: true }),
  PARSED = Symbol('PARSED'),
  SORTED = Symbol('SORTED');

export const reactComponents = reactAnalysis.react.map((api) => {
  const instance = api.instance
    ? wcAnalysis.components.find((i) => i.name === api.instance)
    : undefined;

  parseDocs(api);

  if (instance) {
    parseDocs(instance);
    sortInstanceParts(instance);

    if (instance.props) {
      if (!api.props) api.props = [];

      for (const prop of instance.props) {
        if (api.props.find((p) => p.name === prop.name)) continue;
        api.props.push(prop);
      }
    }

    if (instance.events) {
      if (!api.callbacks) api.callbacks = [];

      for (const event of instance.events) {
        const name = `on${kebabToPascalCase(event.name)}`;
        if (api.callbacks.find((cb) => cb.name === name)) continue;

        const type =
          event.detail.concise === 'void'
            ? `(nativeEvent: ${event.type}) => void`
            : `(detail: ${event.detail}, nativeEvent: ${event.type}) => void`;

        const nativeEventParam = {
          name: 'nativeEvent',
          type: {
            primitive: 'object',
            concise: event.type.concise,
            full: event.type.full,
          },
        };

        const parameters =
          event.detail.concise === 'void'
            ? [nativeEventParam]
            : [{ name: 'detail', type: event.detail }, nativeEventParam];

        api.callbacks.push({
          ...event,
          name,
          type: { primitive: 'function', concise: type, full: type },
          parameters,
        });
      }

      api.callbacks.sort(compareAlphabetically);
    }
  }

  const asChild = api.props?.find((p) => p.name === 'asChild');
  if (asChild) {
    asChild.docs = 'Whether the slotted element should override the default rendered element.';
    asChild.default = 'false';
  }

  const children = api.props?.find((p) => p.name === 'children');
  if (children) {
    children.docs = 'Child JSX nodes.';
    children.default = 'null';
  }

  return {
    ...api,
    instance,
  };
});

export const webComponents = wcAnalysis.elements.map((api) => {
  const instance = api.component
    ? wcAnalysis.components.find((i) => i.name === api.component!.name)
    : undefined;

  parseDocs(api);

  if (instance) {
    parseDocs(instance);
    sortInstanceParts(instance);
  }

  return {
    ...api,
    instance,
  };
});

function sortInstanceParts(meta: ComponentMeta) {
  if (SORTED in meta) return;
  if (meta.props) meta.props.sort(compareAlphabetically);
  if (meta.state) meta.state.sort(compareAlphabetically);
  if (meta.events) meta.events.sort(compareAlphabetically);
  if (meta.cssvars) meta.cssvars.sort(compareAlphabetically);
  (meta as any)[SORTED] = true;
}

function parseDocs(meta: ComponentMeta | CustomElementMeta | ReactComponentMeta) {
  if (PARSED in meta) return;
  walkComponentDocs(meta, (docs) => parser.render(docs.trim()));
  (meta as any)[PARSED] = true;
}

export function getLinks(
  prop: PropMeta | MethodMeta | EventMeta | ReactPropMeta | ReactCallbackMeta,
) {
  return prop.doctags
    ? prop.doctags
        .filter((tag) => /(see|link)/.test(tag.name) && tag.text && tag.text.includes('http'))
        .map((tag) => tag.text!)
    : [];
}

const mdnRE = /(mozilla|mdn)/;
export function findMDNLink(links: string[]) {
  return links.find((tag) => mdnRE.test(tag));
}

function compareAlphabetically(a: { name: string }, b: { name: string }) {
  return a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
}