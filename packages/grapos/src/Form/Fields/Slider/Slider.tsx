import {
  createEffect,
  createMemo,
  JSX,
  on,
  onCleanup,
  Show,
} from 'solid-js';

import Label from '../_Shared/Label/Label';
import { FieldInternalWrapper } from '../_Shared';
import { GrowFade } from '../../../Transitions';
import { createTooltip } from '../../../DataDisplay';

import { FieldPropKeys, FieldProps } from '../_Shared/Types/FieldProps';

import { forwardNativeElementProps } from '../../../Helpers';
import { setupFieldComponent } from '../_Shared/FieldHelpers/setupFieldComponent';
import { useField } from '../_Shared/FieldHelpers/FieldContext';

import './Slider.scss';
import { FormValue } from '../../Types/FormValue';

export interface SliderProps<
OwnerFormValue extends FormValue = {},
> extends FieldProps<number, OwnerFormValue> {
  label?: JSX.Element;

  color?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';

  showTooltip?: boolean;
  renderTooltipContent?: (value: number) => JSX.Element;

  onChange?: (value: number) => void;
}

const Slider = setupFieldComponent(
  forwardNativeElementProps<SliderProps, HTMLInputElement, JSX.InputHTMLAttributes<HTMLInputElement>>(
    (props, elProps) => {
      const step = createMemo(() => parseFloat((elProps.step || 1).toString()));
      const min = createMemo(() => parseFloat((elProps.min || 0).toString()));
      const max = createMemo(() => parseFloat((elProps.max || 100).toString()));

      const {
        elementId: id,
        disabledS: [disabled],
        focusedS: [focused, setFocused],
        valueS: [value, setValue],
        validate,
        hasErrors,
        // eslint-disable-next-line solid/reactivity
      } = useField<number>()!;

      // eslint-disable-next-line prefer-const
      let slider: HTMLDivElement = undefined as any;

      const updateValueBasedOnMouseX = (mouseX: number) => {
        const mouseRelativeX = mouseX - slider.getBoundingClientRect().x;

        let newValue = Math.max(
          Math.min((mouseRelativeX / slider.clientWidth) * max(), max()),
          min()
        );
        newValue = Math.floor(newValue / step()) * step();
        setValue(newValue);

        if (props.onChange) {
          props.onChange(newValue);
        }

        return newValue;
      };

      const handleMouseDown = (e: MouseEvent) => {
        if (!slider.contains(e.target as HTMLElement) && slider !== e.target)
          return;
        if (disabled()) return;

        setFocused(true);
        updateValueBasedOnMouseX(e.x);
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (focused()) {
          const newValue = updateValueBasedOnMouseX(e.x);
          setFocused(false);
          validate(newValue);
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (focused()) {
          updateValueBasedOnMouseX(e.x);
        }
      };

      createEffect(() => {
        const tempSlider = slider;
        tempSlider.addEventListener('mousedown', handleMouseDown, {
          passive: true,
        });
        document.addEventListener('mousemove', handleMouseMove, {
          passive: true,
        });
        document.addEventListener('mouseup', handleMouseUp);

        onCleanup(() => {
          tempSlider.removeEventListener('mousedown', handleMouseDown);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        });
      });

      const { setAnchor, updateBoundingBox, Tooltip } = createTooltip(`${id()}-SliderValueTooltip`);

      const valuePercentageToMaxFromMin = createMemo(
        () => ((value() || min() - min()) / max()) * 100
      );

      const color = createMemo(() => props.color || 'primary');

      createEffect(on(value, () => {
        updateBoundingBox();
      }));

      return (
        <FieldInternalWrapper>
          <Show when={props.label}>
            <Label for={id()} hasErrors={hasErrors()}>
              {props.label}
            </Label>
          </Show>

          <div
            class="slider"
            ref={slider}
            draggable={false}
            classList={{
              focused: focused(),
              disabled: disabled(),

              'has-label': typeof props.label !== 'undefined',

              small: props.size === 'small',
              medium:
                props.size === 'medium' || typeof props.size === 'undefined',
              large: props.size === 'large',

              primary: color() === 'primary',
              secondary: color() === 'secondary',
              tertiary: color() === 'tertiary',
            }}
            style={{
              '--value-percentage': `${valuePercentageToMaxFromMin()}%`,
            }}
          >
            <span class="trunk" draggable={false} />
            <span class="rail" draggable={false} />
            <span class="thumb" ref={setAnchor} draggable={false}>
              <input
                {...elProps}
                min={min()}
                max={max()}
                step={step()}
                id={id()}
                value={(value() || '').toString()}
                type="range"
                disabled={disabled()}
              />
            </span>
          </div>

          <Show
            when={
              typeof props.showTooltip === 'undefined'
                ? true
                : props.showTooltip
            }
          >
            <GrowFade growingOrigin="bottom">
              <Tooltip
                visible={focused()}
                class="slider-value-tooltip"
                style={{
                  '--color': `var(--${color()})`,
                  '--text-color': `var(--text-${color()})`,
                }}
              >
                <Show when={props.renderTooltipContent} fallback={value()}>
                  {props.renderTooltipContent!(value() || min())}
                </Show>
              </Tooltip>
            </GrowFade>
          </Show>
        </FieldInternalWrapper>
      );
    },
    [
      ...FieldPropKeys,
      'label',
      'helperText',
      'color',
      'showTooltip',
      'renderTooltipContent',
      'size',
      'onChange',
    ]
  ),
  // eslint-disable-next-line solid/reactivity
  (props: SliderProps & JSX.InputHTMLAttributes<HTMLInputElement>) => props.min || 0
);

export default Slider;