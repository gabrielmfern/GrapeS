import {
  Component,
  Signal,
  createEffect,
  createMemo,
  createSignal,
  onMount,
  splitProps,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { createStore } from 'solid-js/store';

import { FormFieldValue } from '../../../Types/FormFieldValue';
import { FieldContext } from './FieldContext';
import { FormValue } from '../../../Types/FormValue';

import { FieldPropKeys, FieldProps } from '../Types/FieldProps';

import { setupValidateFunction } from './setupValidateFunction';
import { setupCommunicationWithFormContext } from './setupCommunicationWithFormContext';
import { setupFieldsValueSignal } from './setupFieldValueSignal';
import { setupFieldsDisabledSignal } from './setupFieldsDisabledSignal';

export function setupFieldComponent<
  MProps extends FieldProps,
  AllowedValues extends FormFieldValue = FormFieldValue,
>(
  componentFunc: Component<MProps>,
  initialValueParam: AllowedValues | ((props: MProps) => AllowedValues) = '' as any
) {
  return <
  OwnerFormValue extends FormValue = {}, 
  Props extends FieldProps<AllowedValues, OwnerFormValue> = MProps & FieldProps<AllowedValues, OwnerFormValue>
  >(props: Props) => {
    // eslint-disable-next-line solid/reactivity
    const [errors, setErrors] = props.errorsStore || createStore<string[]>([]);

    const initialValue = typeof initialValueParam === 'function' ? initialValueParam(props as unknown as MProps) : initialValueParam;

    const form = setupCommunicationWithFormContext<Props, OwnerFormValue>(
      props,
      initialValue
    );
    const [value, setValue] = setupFieldsValueSignal<
      Props,
      OwnerFormValue,
      AllowedValues
    >(
      props,
      form,
      initialValue
    );
    const validate = setupValidateFunction(props, setErrors, form);

    const id = createMemo(() =>
      form
        ? `field-${form.identification()}-${props.name.toString()}`
        : `field-${props.name.toString()}`
    );

    const hasContent = createMemo(() => (value() || '').toString().length > 0);
    const hasErrors = createMemo(
      () => errors && Array.isArray(errors) && typeof errors[0] !== 'undefined'
    );

    const disabledSignal = setupFieldsDisabledSignal(props, form);
    // eslint-disable-next-line solid/reactivity
    const [focused, setFocused] = createSignal<boolean>(false);

    createEffect(() => setFocused(props.focused || false));

    onMount(() => {
      if (props.validateOnStartup) {
        validate(value());
      }
    });

    return (
      <FieldContext.Provider
        value={{
          elementId: id,
          errorsT: [errors, setErrors],

          valueS: [value, setValue] as Signal<FormFieldValue>,
          disabledS: disabledSignal,
          focusedS: [focused, setFocused],

          fieldProps: splitProps(
            props,
            FieldPropKeys
          )[0] as unknown as FieldProps,

          hasContent,
          hasErrors,

          validate,
        }}
      >
        <Dynamic component={componentFunc} {...(props as unknown as MProps)} />
      </FieldContext.Provider>
    );
  };
}