import { JSX, Show, createMemo } from 'solid-js';

import Label from '../_Shared/Label/Label';
import { FieldInternalWrapper } from '../_Shared';
import { mergeCallbacks } from '../../../Helpers';
import { useField } from '../_Shared/FieldHelpers/FieldContext';
import { forwardNativeElementProps } from '../../../Helpers';
import { setupFieldComponent } from '../_Shared/FieldHelpers/setupFieldComponent';

import { FieldPropKeys, FieldProps } from '../_Shared/Types/FieldProps';

import { Check } from '../../../Icons';
import { GrowFade } from '../../../Transitions';
import { ClickableSignalizer, Ripple } from '../../../General';

import './Checkbox.scss';
import { FormValue } from '../../Types/FormValue';

export interface CheckboxProps<
OwnerFormValue extends FormValue = {}
> extends FieldProps<boolean, OwnerFormValue> {
  label?: JSX.Element;
  helperText?: JSX.Element;
  color?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';

  onChange?: (value: boolean, event: MouseEvent) => any;
  value?: boolean;
}

const Checkbox = setupFieldComponent(
  forwardNativeElementProps<CheckboxProps, HTMLInputElement>(
    (props, elProps) => {
      const {
        elementId: id,
        disabledS: [disabled],
        valueS: [value, setValue],
        focusedS: [focused, setFocused],
        validate,
        hasErrors,
      } = useField<boolean>()!;

      const color = createMemo(() => props.color || 'primary');

      return (
        <FieldInternalWrapper>
          <Show when={props.label}>
            <Label for={id()} hasErrors={hasErrors()}>
              {props.label}
            </Label>
          </Show>

          <div
            class="checkbox"
            classList={{
              primary: color() === 'primary',
              secondary: color() === 'secondary',
              tertiary: color() === 'tertiary',

              small: props.size === 'small',
              medium:
                typeof props.size === 'undefined' || props.size === 'medium',
              large: props.size === 'large',

              checked: value() === true,
              disabled: disabled(),
            }}
            onClick={(e) => {
              if (!disabled()) {
                const newValue = !value();
                setValue(newValue);
                validate(newValue);

                if (props.onChange) {
                  props.onChange(newValue, e);
                }
              }
            }}
            onMouseEnter={() => setFocused(true)}
            onMouseLeave={() => setFocused(false)}
          >
            <ClickableSignalizer
              show={focused() && !disabled()}
              color={value() ? `var(--${color()})` : undefined}
            >
              <Ripple class="checkbox-internal" color={color()} center>
                <input
                  {...elProps}
                  id={id()}
                  type="checkbox"
                  onBlur={mergeCallbacks<() => void>(
                    // eslint-disable-next-line solid/reactivity
                    elProps.onBlur as any,
                    () => setFocused(false)
                  )}
                  onFocus={mergeCallbacks<() => void>(
                    // eslint-disable-next-line solid/reactivity
                    elProps.onFocus as any,
                    () => setFocused(true)
                  )}
                  value={value() ? 'on' : 'off'}
                />

                <GrowFade>
                  <Show when={value() === true}>
                    <Check class="checked-icon" variant="rounded" />
                  </Show>
                </GrowFade>
              </Ripple>
            </ClickableSignalizer>
          </div>
        </FieldInternalWrapper>
      );
    },
    [...FieldPropKeys, 'label', 'helperText', 'color', 'size', 'onChange']
  ),
  false
);

export default Checkbox;