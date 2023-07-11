import {
  Component,
  createMemo,
  children as accessChildren,
  createSignal,
  JSX,
  onCleanup,
  onMount,
  For,
  createEffect,
  on,
  splitProps,
  ComponentProps,
} from 'solid-js';

import InputContainer from '../_Shared/InputContainer/InputContainer';
import FieldInternalWrapper from '../_Shared/FieldInternalWrapper/FieldInternalWrapper';
import { Dropdown } from '../../../General';
import { GrowFade } from '../../../Transitions';
import { KeyboardArrowDown } from '../../../Icons';

import { mergeClass } from '../../../_Shared/Utils';

import { FormFieldValue } from '../../Types/FormFieldValue';
import { FieldPropKeys, FieldProps } from '../_Shared/Types/FieldProps';

import './Select.scss';
import { forwardNativeElementProps } from '../../../Helpers';
import { useField } from '../_Shared/FieldHelpers/FieldContext';
import { setupFieldComponent } from '../_Shared/FieldHelpers/setupFieldComponent';
import { mergeCallbacks } from '../../../Helpers';
import { FormValue } from '../../Types/FormValue';

export interface SelectProps<
OwnerFormValue extends FormValue = {}
> extends FieldProps<any, OwnerFormValue> {
  label?: JSX.Element;

  color?: 'primary' | 'secondary' | 'tertiary';

  onChange?: (newValue: FormFieldValue) => any;
  onFocus?: () => any;
}

export interface SelectOptionProps extends JSX.HTMLAttributes<HTMLDivElement> {
  value: FormFieldValue;
  children: JSX.Element;
}

const Option: Component<SelectOptionProps> = (props) =>
  props as unknown as JSX.Element;

/**
 * @description The component to be able to select only one option among many such as choosing a state/county,
 * a payment type or any other thing you wish.
 *
 * The values of the options can be written using the `Select.Option` component which just returns the
 * props of the Option instead of rendering it. The `Select` is the one that renders it. All other children
 * of the Select *will be ignored*.
 *
 * @example
 * ```tsx
 * <Select
 *   name='bestGame'
 *   label='Which one is better?'
 *   helperText='OBS: choose Terraria :)'
 *   validators={[Validators.required]}
 * >
 *   <Select.Option value='minecraft'>Minecraft</Select.Option>
 *   <Select.Option value='terraria'>Terraria</Select.Option>
 *   <Select.Option value='starbound'>Starbound</Select.Option>
 *   <Select.Option value='stardew-valley'>Stardew Valley</Select.Option>
 * </Select>
 * ```
 */
const Select = setupFieldComponent(
  forwardNativeElementProps<SelectProps, HTMLDivElement>(
    (props, elProps) => {
      const {
        elementId: id,
        disabledS: [disabled],
        focusedS: [focused, setFocused],
        valueS: [value, setValue],
        validate,
      } = useField()!;

      const [inputContainerRef, setInputContainerRef] =
        createSignal<HTMLDivElement>();

      const onDocumentClick = (event: MouseEvent) => {
        if (event.target !== inputContainerRef() && focused()) {
          setFocused(false);
        }
      };

      onMount(() => {
        document.addEventListener('click', onDocumentClick);
      });

      onCleanup(() => {
        document.removeEventListener('click', onDocumentClick);
      });

      const getChildren = accessChildren(() => elProps.children);
      const options = createMemo<SelectOptionProps[]>(() => {
        let childrenArr: (JSX.Element | SelectOptionProps)[];

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
        }) as SelectOptionProps[];
      });

      const optionLabelFromValue = (value: FormFieldValue | undefined) => {
        return options().find((opt) => opt.value === value)?.children || '';
      };

      createEffect(
        on(
          focused,
          () => {
            if (props.onFocus && focused() === true) {
              props.onFocus();
            }

            if (focused() === false) {
              validate(value());
            }
          },
          { defer: true }
        )
      );

      return (
        <FieldInternalWrapper
          style={{
            cursor: disabled() === false ? 'pointer' : 'default',
          }}
        >
          <InputContainer
            {...elProps}
            id={id()}
            labelFor={id()}
            label={props.label}
            color={props.color}
            onClick={(e) => {
              if (typeof elProps.onClick === 'function') {
                elProps.onClick(e);
              }

              if (!disabled()) {
                setFocused((focused) => !focused);
              }
            }}
            icon={
              <KeyboardArrowDown
                variant="rounded"
                class="select-icon"
                classList={{
                  open: focused(),
                }}
              />
            }
            ref={(ref) => {
              if (typeof elProps.ref === 'function') {
                elProps.ref(ref);
              }

              setInputContainerRef(ref);
            }}
          >
            {optionLabelFromValue(value())}
          </InputContainer>

          <GrowFade>
            <Dropdown
              for={inputContainerRef()!}
              class="select-dropdown"
              visible={focused()}
              classList={{
                primary:
                  props.color === 'primary' ||
                  typeof props.color === 'undefined',
                secondary: props.color === 'secondary',
                tertiary: props.color === 'tertiary',
              }}
            >
              <For each={options()}>
                {(optionAllProps) => {
                  const [optionProps, optionElProps] = splitProps(
                    optionAllProps,
                    ['value']
                  );
                  return (
                    <div
                      {...optionElProps}
                      class={mergeClass('option', optionElProps.class)}
                      classList={{
                        active: optionProps.value === value(),
                        ...optionElProps.classList,
                      }}
                      onClick={mergeCallbacks<(e: MouseEvent) => void>(
                        // eslint-disable-next-line solid/reactivity
                        optionElProps.onClick as any,
                        // eslint-disable-next-line solid/reactivity
                        () => {
                          if (props.onChange) {
                            props.onChange(optionProps.value);
                          }

                          setValue(optionProps.value);
                          setFocused(false);
                        }
                      )}
                    >
                      {optionElProps.children}
                    </div>
                  );
                }}
              </For>
            </Dropdown>
          </GrowFade>
        </FieldInternalWrapper>
      );
    },
    [...FieldPropKeys, 'label', 'helperText', 'color', 'onChange', 'onFocus']
  )
) as {
  <OwnerFormValue extends FormValue>(props: SelectProps<OwnerFormValue> & ComponentProps<'div'>): JSX.Element;
  Option(props: SelectOptionProps): JSX.Element;
};

Select.Option = Option;

export default Select;