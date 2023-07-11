import { JSX } from 'solid-js/jsx-runtime';

/**
  * @description A type function that can be used to infer the props of a component from its type.
  *
  * @example
  * ```tsx
  * const Comp = (props: { name: string; children: JSX.Element }) => <></>;
  *
  * type CompProps = GetProps<typeof Comp>;
  * // { name: string; children: JSX.Element }
  * ```
  */
export type GetProps<Component> = Component extends (props: infer P) => JSX.Element
  ? P
  : never;