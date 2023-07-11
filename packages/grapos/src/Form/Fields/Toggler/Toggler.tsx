import { JSX, Show } from 'solid-js';


import { FieldInternalWrapper } from '../_Shared';
import Label from '../_Shared/Label/Label';

import { FieldPropKeys, FieldProps } from '../_Shared/Types/FieldProps';
import { FormValue } from '../../Types/FormValue';

import './Toggler.scss';
import { useField } from '../_Shared/FieldHelpers/FieldContext';
import { setupFieldComponent } from '../_Shared/FieldHelpers/setupFieldComponent';
import { forwardNativeElementProps } from '../../../Helpers';

export interface TogglerProps<OwnerFormValue extends FormValue = {}> extends FieldProps<boolean, OwnerFormValue> {
  label?: JSX.Element;

  color?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';

  onChange?: (value: boolean, event: MouseEvent) => any;
}

const Toggler = setupFieldComponent(
  forwardNativeElementProps<TogglerProps, HTMLInputElement>(
    (props, elProps) => {
      const {
        elementId: id,

        disabledS: [disabled],
        valueS: [value, setValue],

        validate,
        hasErrors,
      } = useField<boolean>()!;

      return (
        <FieldInternalWrapper class="toggler-container">
          <Show when={props.label}>
            <Label for={id()} hasErrors={hasErrors()}>
              {props.label}
            </Label>
          </Show>

          <div class="toggler">
            <input
              {...elProps}
              id={id()}
              type="checkbox"
              class={elProps.class}
              classList={{
                on: value() === true,
                off: value() === false || typeof value() === 'undefined',

                disabled: disabled(),

                primary:
                  props.color === 'primary' ||
                  typeof props.color === 'undefined',
                secondary: props.color === 'secondary',
                tertiary: props.color === 'tertiary',

                small: props.size === 'small',
                medium:
                  props.size === 'medium' || typeof props.size === 'undefined',
                large: props.size === 'large',

                ...elProps.classList,
              }}
              value={value() ? 'on' : 'off'}
              onClick={(event) => {
                if (!disabled()) {
                  const newValue = !value();

                  if (typeof props.onChange !== 'undefined') {
                    props.onChange(newValue, event);
                  }

                  setValue(newValue);
                  validate(newValue);
                }
              }}
            />
          </div>
        </FieldInternalWrapper>
      );
    },
    [...FieldPropKeys, 'label', 'helperText', 'color', 'size', 'onChange']
  ),
  false
);

export default Toggler;