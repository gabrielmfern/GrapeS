import { Component, splitProps } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';

export function forwardNativeElementProps<
Props extends Record<string, any>, 
ElementType extends HTMLElement, 
ElementProps = JSX.HTMLAttributes<ElementType>
>(
  componentFunc: (props: Props, elProps: Omit<ElementProps, keyof Props>) => JSX.Element | JSX.Element[],
  componentPropNames: (keyof Props)[],
): Component<Props & ElementProps> {
  return (allProps: Props & ElementProps) => componentFunc(
    ...splitProps(allProps, componentPropNames)
  );
}