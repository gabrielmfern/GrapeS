import { Accessor, createEffect, createMemo, createSignal, on, Setter, Signal } from 'solid-js';

import { FormProviderValue } from '../../../FormContext';
import { FormValue } from '../../../Types/FormValue';

import { FieldProps } from '../Types/FieldProps';

export function setupFieldsDisabledSignal<
  T extends FieldProps<any, K>,
  K extends FormValue = FormValue
>(props: T, form: FormProviderValue<K> | undefined): Signal<boolean> {
  let signal: Signal<boolean>;

  if (typeof form !== 'undefined') {
    const disabled: Accessor<boolean> = createMemo(
      () => form.isDisabled(props.name)
    );
    const setDisabled: Setter<boolean> = (
      (v: boolean) => form.setDisabled(props.name, v)
    ) as any;

    signal = [disabled, setDisabled];
  } else {
    // eslint-disable-next-line solid/reactivity
    signal = createSignal<boolean>(false);
  }

  const [disabled, setDisabled] = signal;

  createEffect(on(() => props.disabled, () => {
    setDisabled(props.disabled || false);
  }));

  return [disabled, setDisabled];
}