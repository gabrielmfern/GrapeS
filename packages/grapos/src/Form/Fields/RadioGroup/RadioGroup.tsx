import {
  ComponentProps,
  For,
  children as accessChildren,
  JSX,
  ParentProps,
  Show,
  createMemo,
  createSignal,
} from 'solid-js';

import { setupFieldComponent } from '../_Shared/FieldHelpers/setupFieldComponent';

import Label from '../_Shared/Label/Label';
import { FieldInternalWrapper } from '../_Shared';

import { FieldPropKeys, FieldProps } from '../_Shared/Types/FieldProps';

import './RadioGroup.scss';
import { ClickableSignalizer, Ripple } from '../../../General';
import { mergeCallbacks } from '../../../Helpers';
import { forwardNativeElementProps } from '../../../Helpers';
import { useField } from '../_Shared/FieldHelpers/FieldContext';
import { mergeClass } from '../../../_Shared/Utils';
import { Stack } from '../../../Layout';
import { StackProps } from '../../../Layout/Stack/Stack';
import { FormValue } from '../../Types/FormValue';

export interface RadioGroupOptionProps extends ParentProps {
  value: string;

  color?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;

  onClick?: (e: MouseEvent) => void;
}

const RadioOption = (props: RadioGroupOptionProps & ComponentProps<'input'>) =>
  props as unknown as JSX.Element;

const RadioInternal = forwardNativeElementProps<
  RadioGroupOptionProps,
  HTMLInputElement
>(
  (props, elProps) => {
    const {
      elementId: groupId,
      valueS: [groupValue],
      disabledS: [groupDisabled],

      hasErrors,
    } = useField<string>()!;

    const id = createMemo(() => `${groupId()}-${props.value}`);

    const [isRadioFocused, setRadioToFocused] = createSignal(false);

    const isDisabled = createMemo(() => props.disabled || groupDisabled());
    const isChecked = createMemo(() => props.value === groupValue());

    return (
      <div
        class="radio-container"
        onClick={(e) => {
          if (props.onClick && !isDisabled()) {
            props.onClick(e);
          }
        }}
      >
        <div
          class="radio"
          classList={{
            primary: props.color === 'primary',
            secondary: props.color === 'secondary',
            tertiary: props.color === 'tertiary',

            small: props.size === 'small',
            medium: props.size === 'medium',
            large: props.size === 'large',

            checked: isChecked(),
            disabled: isDisabled(),
          }}
          onMouseEnter={() => setRadioToFocused(true)}
          onMouseLeave={() => setRadioToFocused(false)}
        >
          <ClickableSignalizer
            color={isChecked() ? `var(--${props.color})` : undefined}
            show={isRadioFocused() && !isDisabled()}
          >
            <Ripple class="radio-internal" noRipple={isDisabled()} color={props.color} center>
              <input
                {...elProps}
                id={id()}
                type="radio"
                value={groupValue()}
                onFocus={mergeCallbacks(
                  elProps.onFocus as any,
                  () => setRadioToFocused(true)
                )}
                onBlur={mergeCallbacks(
                  elProps.onBlur as any,
                  () => setRadioToFocused(false)
                )}
              />
            </Ripple>
          </ClickableSignalizer>
        </div>

        <Show when={props.children}>
          <Label for={id()} hasErrors={hasErrors()}>
            {props.children}
          </Label>
        </Show>
      </div>
    );
  },
  ['value', 'children', 'color', 'disabled', 'size', 'onClick']
);

export interface RadioGroupProps<
OwnerFormValue extends FormValue = {}
> extends FieldProps<any, OwnerFormValue>, ParentProps {
  label?: JSX.Element;
  helperText?: JSX.Element;

  color?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  radiosDirection?: StackProps['direction'];

  onChange?: (value: string, event: MouseEvent) => any;
  value?: string;
}

const RadioGroup = setupFieldComponent(
  forwardNativeElementProps<RadioGroupProps, HTMLDivElement>(
    (props, elProps) => {
      const color = createMemo(() => props.color || 'primary');
      const {
        elementId: id,

        disabledS: [disabled],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        valueS: [_value, setValue],

        hasErrors,

        validate,
      } = useField<string>()!;

      const getChildren = accessChildren(() => props.children);
      const options = createMemo<RadioGroupOptionProps[]>(() => {
        let childrenArr: (JSX.Element | RadioGroupOptionProps)[];

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
        }) as RadioGroupOptionProps[];
      });

      return (
        <FieldInternalWrapper
          {...elProps}
          class={mergeClass('radio-group', elProps.class)}
        >
          <Show when={props.label}>
            <Label for={id()} hasErrors={hasErrors()}>
              {props.label}
            </Label>
          </Show>

          <Stack spacing={10} direction={props.radiosDirection}>
            <For each={options()}>
              {(optionProps, i) => (
                <RadioInternal
                  {...optionProps}
                  tabindex={i()}
                  color={optionProps.color || color()}
                  size={optionProps.size || props.size || 'medium'}
                  onClick={mergeCallbacks(
                    optionProps.onClick,
                    (e) => {
                      if (!disabled()) {
                        const newValue = optionProps.value;
                        setValue(newValue);
                        validate(newValue);

                        if (props.onChange) {
                          props.onChange(newValue, e);
                        }
                      }
                    }
                  )}
                />
              )}
            </For>
          </Stack>
        </FieldInternalWrapper>
      );
    },
    [
      ...FieldPropKeys,
      'label',
      'radiosDirection',
      'helperText',
      'color',
      'size',
      'onChange',
      'children',
    ]
  )
) as {
  <OwnerFormValue extends FormValue>(props: RadioGroupProps<OwnerFormValue> & ComponentProps<'div'>): JSX.Element;
  Option(props: RadioGroupOptionProps & ComponentProps<'input'>): JSX.Element;
};

RadioGroup.Option = RadioOption;

export default RadioGroup;