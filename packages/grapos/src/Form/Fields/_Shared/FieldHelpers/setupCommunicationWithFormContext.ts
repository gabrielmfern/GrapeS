import { onCleanup, onMount } from 'solid-js';
import { produce } from 'solid-js/store';

import { useForm } from '../../../Form';

import { FormFieldValue } from '../../../Types/FormFieldValue';
import { FormValue } from '../../../Types/FormValue';
import { FormProviderValue } from '../../../FormContext';

import { FieldProps } from '../Types/FieldProps';

export function setupCommunicationWithFormContext<
  T extends FieldProps<any, K>,
  K extends FormValue = FormValue
>(props: T, initialValue: FormFieldValue = ''): FormProviderValue<K> | undefined {
  let form: FormProviderValue<K> | undefined = useForm<K>();
  if (props.manuallyControlled) {
    form = undefined;
  }

  if (form) {
    onMount(() => {
      if (typeof form!.valueFor(props.name) !== 'undefined') {
        form!.store[1](produce(form => {
          form.errors[props.name] = [];
        }));
      }

      form!.init(
        props.name,
        props.validators || [],
        (form!.valueFor(props.name) || initialValue as any)
      );
    });

    onCleanup(() => {
      form!.cleanUp(props.name);
    });

    return form;
  } else {
    return undefined;
  }
}