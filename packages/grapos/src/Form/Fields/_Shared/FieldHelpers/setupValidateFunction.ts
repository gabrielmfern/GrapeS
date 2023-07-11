import { createEffect, Setter } from 'solid-js';

import { FormFieldValue } from '../../../Types/FormFieldValue';
import { FormValue } from '../../../Types/FormValue';
import { FormProviderValue } from '../../../FormContext';

import { FieldProps } from '../Types/FieldProps';

export type FieldInternalValidate = (value: FormFieldValue) => string[] | undefined;

export function setupValidateFunction<
  T extends FieldProps<any, K>,
  K extends FormValue = FormValue
>(props: T, setErrors: Setter<string[]>, form: FormProviderValue<K> | undefined): FieldInternalValidate {
  if (typeof form !== 'undefined') {
    createEffect(() => {
      setErrors(form.getErrors(props.name) || []);
    });
  }

  return (value: FormFieldValue) => {
    if (typeof form !== 'undefined') {
      form.validate(props.name);

      const newErrors = form.getErrors(props.name);

      return newErrors;
    } else if (typeof props.validators !== 'undefined') {
      const newErrors = props.validators
        // we assert it to be truthy here since we filter(Boolean) after
        .map(validator => validator(value)!)
        .filter(Boolean)
        .flat();

      setErrors(newErrors);

      return newErrors;
    }
  }
}