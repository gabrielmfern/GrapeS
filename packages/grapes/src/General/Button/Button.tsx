import { Component, createMemo, JSX, ParentProps } from "solid-js";
import { useDepth } from "../Box/Box";
import Ripple from "../Ripple/Ripple";

import './Button.scss';

export type ButtonProps = ParentProps<{
  color?: 'primary' | 'secondary' | 'tertiary',
  size?: 'small' | 'medium' | 'large',
  type?: 'default' | 'empty' | 'icon' | 'rounded',

  disabled?: boolean,

  style?: JSX.CSSProperties,
  class?: string,
  classList?: Record<string, boolean>,

  onClick?: (event: MouseEvent) => any,
}>;

const Button: Component<ButtonProps> = (props) => {
  const depth = useDepth() || (() => 0);

  const color = createMemo(() => props.color || 'primary');
  const rippleColor = createMemo(() => {
    const buttonType = props.type || 'default';
    switch (buttonType) {
      case 'empty':
        return `var(--lightened-${color()})`;
      case 'default':
        return `var(--text-${color()})`;
    }
  });

  return <Ripple
    onClick={(event) => {
      if (props.onClick && !props.disabled) {
        props.onClick(event);
      }
    }}
    classList={{
      'icon': props.type === 'icon',
      'rounded': props.type === 'rounded',

      'small': props.size === 'small',
      'medium': props.size === 'medium' || typeof props.size === 'undefined',
      'large': props.size === 'large',
    }}
    noRipple={props.disabled}
    color={rippleColor()}
    style={{ display: 'inline-block' }}
  >
    <button
      class={props.class}
      type='button'
      style={props.style}
      classList={{
        'primary': color() === 'primary',
        'secondary': color() === 'secondary',
        'tertiary': color() === 'tertiary',

        'disabled': props.disabled,

        'icon': props.type === 'icon',
        'rounded': props.type === 'rounded',

        'empty': props.type === 'empty',
        'gray-1': depth() === 0,
        'gray-2': depth() === 1,
        'gray-3': depth() === 2,
        'gray-4': depth() === 3,

        'small': props.size === 'small',
        'medium': props.size === 'medium' || typeof props.size === 'undefined',
        'large': props.size === 'large',

        ...props.classList
      }}
    >{props.children}</button>
  </Ripple>;
}

export default Button;