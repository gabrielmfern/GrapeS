import { JSX } from 'solid-js';

import { createInputMask } from '@solid-primitives/input-mask';

import InputContainer from '../_Shared/InputContainer/InputContainer';
import FieldInternalWrapper from '../_Shared/FieldInternalWrapper/FieldInternalWrapper';

import { MaskedFieldPropsKeys, MaskedFieldProps } from '../_Shared/Types/MaskedFieldProps';

import './TextArea.scss';
import { useField } from '../_Shared/FieldHelpers/FieldContext';
import { forwardNativeElementProps } from '../../../Helpers';
import { mergeCallbacks } from '../../../Helpers';
import { setupFieldComponent } from '../_Shared/FieldHelpers/setupFieldComponent';
import { FormValue } from '../../Types/FormValue';

export type TextAreaChangeEvent = Event & {
  currentTarget: HTMLTextAreaElement;
  target: HTMLTextAreaElement;
};

export interface TextAreaProps<
OwnerFormValue extends FormValue = {}
> extends MaskedFieldProps<string, OwnerFormValue> {
  label?: JSX.Element;

  color?: 'primary' | 'secondary' | 'tertiary';

  onChange?: (newValue: string, event?: TextAreaChangeEvent) => any;
}

const TextArea = setupFieldComponent(
  forwardNativeElementProps<TextAreaProps, HTMLTextAreaElement, JSX.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    (props, elProps) => {
      const {
        elementId: id,

        disabledS: [disabled],
        valueS: [value, setValue],

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        focusedS: [_focused, setFocused],
        validate,
      } = useField<string>()!;

      return (
        <FieldInternalWrapper>
          <InputContainer
            labelFor={id()}
            color={props.color}
            label={props.label}
          >
            <textarea
              {...elProps}
              id={id()}
              value={(value() || '').toString()}
              disabled={disabled()}
              class={elProps.class}
              classList={{
                'no-label': typeof props.label === 'undefined',
                ...elProps.classList,
              }}
              onInput={mergeCallbacks(
                elProps.onInput as any,
                props.mask ? createInputMask(props.mask) : undefined,
                (event: InputEvent & { target: HTMLTextAreaElement, currentTarget: HTMLTextAreaElement }) => {
                  event.target.style.height = '0px';
                  const scrollHeight = Math.max(event.target.scrollHeight, 54);
                  event.target.style.height = `${scrollHeight}px`;

                  event.target.parentElement!.style.height = `${scrollHeight}px`;

                  if (props.onChange) {
                    props.onChange(event.currentTarget.value, event);
                  }

                  setValue(event.currentTarget.value);
                }
              )}
              onFocus={mergeCallbacks(elProps.onFocus as any, () => {
                setFocused(true);
              })}
              onBlur={mergeCallbacks(elProps.onBlur as any, () => {
                validate(value());
                setFocused(false);
              })}
            />
          </InputContainer>
        </FieldInternalWrapper>
      );
    },
    [...MaskedFieldPropsKeys, 'label', 'helperText', 'color', 'onChange']
  )
);

export default TextArea;