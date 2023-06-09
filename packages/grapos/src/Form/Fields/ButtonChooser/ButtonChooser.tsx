import {
  Component,
  createMemo,
  children as accessChildren,
  JSX,
  on,
  createEffect,
  For,
  Show,
  ComponentProps,
} from 'solid-js';
import Button, { ButtonProps } from '../../../General/Button/Button';

import FieldInternalWrapper from '../_Shared/FieldInternalWrapper/FieldInternalWrapper';
import Label from '../_Shared/Label/Label';

import { mergeClass } from '../../../_Shared/Utils';

import { FormFieldValue } from '../../Types/FormFieldValue';
import { FieldPropKeys, FieldProps } from '../_Shared/Types/FieldProps';

import './ButtonChooser.scss';
import { useField } from '../_Shared/FieldHelpers/FieldContext';
import { forwardNativeElementProps } from '../../../Helpers';
import { setupFieldComponent } from '../_Shared/FieldHelpers/setupFieldComponent';
import { Key } from '../../../_Shared/Types/Key';

export interface ButtonChooserProps<T extends Key> extends FieldProps<T> {
  label?: JSX.Element;
  color?: 'primary' | 'secondary' | 'tertiary';
  helperText?: JSX.Element;

  style?: JSX.CSSProperties;

  onChange?: (newValue: FormFieldValue) => any;
}

export interface ButtonChooserOptionProps extends ButtonProps {
  value: string;
}

const Option: Component<ButtonChooserOptionProps> = (props) => {
  return props as unknown as JSX.Element;
};

const ButtonChooser = setupFieldComponent(
  forwardNativeElementProps<ButtonChooserProps<string>, HTMLDivElement>(
    (props, elProps) => {
      const {
        elementId: id,
        disabledS: [disabled],
        valueS: [value, setValue],
        validate,
        hasErrors,
      } = useField()!;

      const getChildren = accessChildren(() => elProps.children);
      const options = createMemo<ButtonChooserOptionProps[]>(() => {
        let childrenArr: (JSX.Element | ButtonChooserOptionProps)[];

        const children = getChildren();
        if (Array.isArray(children)) {
          childrenArr = children;
        } else {
          childrenArr = [children];
        }

        return childrenArr.filter((child) => {
          return (
            child !== null &&
            typeof child === 'object' &&
            Object.hasOwn(child, 'value') &&
            Object.hasOwn(child, 'children')
          );
        }) as ButtonChooserOptionProps[];
      });

      createEffect(
        on(
          value,
          (newValue) => {
            validate(newValue);
          },
          { defer: true }
        )
      );

      const color = createMemo(() => props.color || 'primary');

      return (
        <FieldInternalWrapper
          {...elProps}
          class={mergeClass('button-chooser', elProps.class)}
          style={{
            height: 'fit-content',
            ...props.style,
          }}
        >
          <Show when={props.label}>
            <Label for={id()} hasErrors={hasErrors()}>
              {props.label}
            </Label>
          </Show>

          <div id={id()} class="buttons">
            <For each={options()}>
              {(opt) => (
                <Button.Empty
                  color={color()}
                  disabled={disabled()}
                  {...opt}
                  class={opt.class}
                  classList={{
                    active: opt.value === value(),
                    ...opt.classList,
                  }}
                  onClick={(event) => {
                    setValue(opt.value);

                    if (props.onChange) {
                      props.onChange(opt.value);
                    }

                    if (typeof opt.onClick === 'function') {
                      opt.onClick(event);
                    }
                  }}
                >
                  {opt.children}
                </Button.Empty>
              )}
            </For>
          </div>
        </FieldInternalWrapper>
      );
    },
    [...FieldPropKeys, 'label', 'color', 'helperText', 'onChange', 'style']
  )
) as {
  <T extends Key>(props: ButtonChooserProps<T> & ComponentProps<'div'>): JSX.Element;
  Option(props: ButtonChooserOptionProps): JSX.Element;
};

ButtonChooser.Option = Option;

export default ButtonChooser;
