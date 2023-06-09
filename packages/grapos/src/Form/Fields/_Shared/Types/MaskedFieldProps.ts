import { InputMask } from '@solid-primitives/input-mask';

import { FieldPropKeys, FieldProps } from './FieldProps';
import { Key } from '../../../../_Shared/Types/Key';

export const MaskedFieldPropsKeys: (keyof MaskedFieldProps<string>)[] = [
  ...FieldPropKeys,
  'mask',
];

export interface MaskedFieldProps<FormFieldKeys extends Key>
  extends FieldProps<FormFieldKeys> {
  /**
   * @description The mask that should be applied to the field.
   *
   * This can be one of:
   * - an array of masks (regex or string) for each character that can be in the field,
   * - a function that directly determines a new **value** and **selection** from the current **value** and **selection**,
   * - a mask regex tuple that contains the **regex** and then a replacer function to replace each matching character with,
   * - a simple string that will be converted into *an array of masks* again as follows:
   *     \* 9 -> /\d/;
   *     \* a -> /[a-z]/i;
   *     \* * -> /\w/i;
   *     \* Any other character -> itself.
   *
   * The mask functionality in GrapeS is taken from solid primitives's
   * [input-mask](https://github.com/solidjs-community/solid-primitives/tree/main/packages/input-mask).
   *
   * @see {@link maskShouldChangeUnderlyingValue}.
   */
  mask?: InputMask;
}
