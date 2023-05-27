import { Component, createEffect, createMemo, createSignal, For, Index, JSX, Match, on, onCleanup, onMount, splitProps, Switch } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Box, Button, Dropdown } from '../../../General';
import { ArrowLeft, ArrowRight, CalendarMonth } from '../../../Icons';
import { Row } from '../../../Layout/Grid';
import { dbg } from '../../../_Shared/Utils';
import { FieldValue, FormValue } from '../../FormContext';
import ButtonChooser from '../ButtonChooser/ButtonChooser';
import { InputContainer } from '../_Shared';
import FieldInternalWrapper from '../_Shared/FieldInternalWrapper/FieldInternalWrapper';

import { FieldPropKeys, FieldProps, setupField } from '../_Shared/Utilts';

import './Datepicker.scss';

export interface DatepickerProps extends FieldProps, JSX.HTMLAttributes<HTMLDivElement> {
  label?: string;
  helperText?: string;

  color?: 'primary' | 'secondary' | 'tertiary';

  style?: JSX.CSSProperties;

  onChange?: (newValue: FieldValue) => any;
  onFocused?: () => any;
}

interface DatepickerDay {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  dateAtDay: Date;
  day: number;
}

const amountOfDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const DatepickerInternalDayPicker: Component<{
  month: number;
  year: number;

  selectedDate: Date;

  onDayClicked: (newDate: Date) => any,
}> = (props) => {
  const amountOfDaysInCurrentMonth = createMemo(() => amountOfDaysInMonth(props.year, props.month));

  const daysOfCurrentMonth = createMemo(() => {
    const daysAmonut = amountOfDaysInCurrentMonth();

    const days: DatepickerDay[] = [];

    for (let index = 0; index < daysAmonut; index++) {
      const day = index + 1;
      const dateAtDay = new Date(props.year, props.month, day);
      days.push({
        day,
        dateAtDay,
        weekday: dateAtDay.getDay() as any
      });
    }

    return days;
  });

  const daysToShow = createMemo(() => {
    const days = [...daysOfCurrentMonth()];
    if (days.length > 0) {
      const month = props.month;
      const year = props.year;

      const firstDay = days[0];
      // loops through all days from monday to the first day
      // of the month
      for (let i = 0; i < firstDay.weekday; i++) {
        const date = new Date(year, month, -i);
        days.unshift({
          day: date.getDate(),
          weekday: date.getDay() as any,
          dateAtDay: date,
        });
      }

      const lastDay = days[days.length - 1];
      const daysMissingTo42 = 42 - days.length;
      for (let i = 0; i < daysMissingTo42; i++) {
        const date = new Date(year, month, lastDay.day + i + 1);
        days.push({
          day: date.getDate(),
          weekday: date.getDay() as any,
          dateAtDay: date,
        });
      }

      return days;
    } else {
      return [];
    }
  });

  return <div class='days-listing'>
    <span class='entry header'>S</span>
    <span class='entry header'>M</span>
    <span class='entry header'>T</span>
    <span class='entry header'>W</span>
    <span class='entry header'>T</span>
    <span class='entry header'>F</span>
    <span class='entry header'>S</span>

    <For each={daysToShow()}>{
      (day) => <span
        class='entry'
        classList={{
          'outside-of-view': day.dateAtDay.getMonth() !== props.month,
        }}
      >
        <Button.Icon
          size='small'
          classList={{
            'active': props.selectedDate.getMonth() === day.dateAtDay.getMonth()
              && props.selectedDate.getDate() === day.dateAtDay.getDate()
              && props.selectedDate.getFullYear() === day.dateAtDay.getFullYear()
          }}
          onClick={() => props.onDayClicked(day.dateAtDay)}
        >
          {day.day}
        </Button.Icon>
      </span>
    }</For>
  </div>;
};

const DatepickerInternalMonthPicker: Component<{
  month: number;
  year: number;

  monthNames: string[];
  selectedDate: Date;

  onMonthClicked: (month: number) => any,
}> = (props) => {
  return <div class='months-listing'>
    <Index each={props.monthNames}>{
      (month, monthNumber) => (
        <span class='entry'>
          <Button.Rounded
            size='small'
            classList={{
              active: monthNumber === props.selectedDate.getMonth()
                && props.year === props.selectedDate.getFullYear()
            }}
            onClick={props.onMonthClicked(monthNumber)}
          >{month()}</Button.Rounded>
        </span>
      )
    }</Index>
  </div>;
};

const DatepickerIntenralYearPicker: Component<{
  month: number;
  year: number;

  selectedDate: Date;

  onYearClicked: (month: number) => any,
}> = (props) => {
  const years = createMemo(() => {
    const result = [];
    const start = props.year - 7;
    const end = props.year + 8;
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  });

  return <div class='years-listing'>
    <Index each={years()}>{
      (year) => (
        <span class='entry'>
          <Button.Rounded
            size='small'
            classList={{
              active: props.month === props.selectedDate.getMonth()
                && year() === props.selectedDate.getFullYear()
            }}
            onClick={props.onYearClicked(year())}
          >{year()}</Button.Rounded>
        </span>
      )
    }</Index>
  </div>;
};

const Datepicker: Component<DatepickerProps> = (allProps) => {
  const [props, elProps] = splitProps(
    allProps, 
    [...FieldPropKeys, 'label', 'helperText', 'color', 'onChange', 'onFocused']
  );

  const {
    elementId: id,
    errorsStore: [errors, _setErrors],
    disabledSignal: [disabled, _setDisabled],
    focusedSignal: [focused, setFocused],
    valueSignal: [value, setValue],
    validate,
    hasContent,
  } = setupField<DatepickerProps, FormValue, Date>(props, new Date());

  const [inputContainerRef, setInputContainerRef] = createSignal<HTMLDivElement>();
  const [dropdownRef, setDropdownRef] = createSignal<HTMLDivElement>();

  const onDocumentClick = (event: MouseEvent) => {
    if (event.target !== inputContainerRef()
      && event.target !== dropdownRef()
      && !dropdownRef()?.contains(event.target as HTMLElement)
      && focused()) {
      setFocused(false);
    }
  };

  onMount(() => {
    document.addEventListener('click', onDocumentClick);
  });

  onCleanup(() => {
    document.removeEventListener('click', onDocumentClick);
  });

  const [datepickerSelectionType, setDatepickerSelectionType] = createSignal<'day' | 'month' | 'year'>('day');

  createEffect(on(focused, () => {
    if (props.onFocused && focused() === true) {
      props.onFocused();
    }

    if (focused() === false) {
      validate(value());
      setDatepickerSelectionType('day');
    }
  }, { defer: true }));

  const [viewedMonth, setViewedMonth] = createSignal<number>(
    value() ? value()!.getMonth() : new Date().getMonth()
  );

  const [viewedYear, setViewedYear] = createSignal<number>(
    value() ? value()!.getFullYear() : new Date().getFullYear()
  );

  createEffect(() => {
    const currentDate = value() || new Date();

    setViewedMonth(currentDate.getMonth());
    setViewedYear(currentDate.getFullYear());
  });

  const handleNext = () => {
    switch (datepickerSelectionType()) {
      case 'day':
        if (viewedMonth() === 11) {
          setViewedYear(year => year + 1);
          setViewedMonth(0);
        } else {
          setViewedMonth(month => month + 1);
        }
        break;
      case 'month':
        setViewedYear(year => year + 1);
        break;
      case 'year':
        setViewedYear(year => year + 15);
        break;
    }
  };

  const handlePrevious = () => {
    switch (datepickerSelectionType()) {
      case 'day':
        if (viewedMonth() === 0) {
          setViewedYear(year => year - 1);
          setViewedMonth(11);
        } else {
          setViewedMonth(month => month - 1);
        }
        break;
      case 'month':
        setViewedYear(year => year - 1);
        break;
      case 'year':
        setViewedYear(year => year - 15);
        break;
    }
  };

  createEffect(on(value, () => {
    setFocused(false);
  }));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const displayDate = createMemo(() => {
    const selectedDate = value();

    if (selectedDate) {
      const DD = ('00' + selectedDate.getDate()).slice(-2);
      const MM = ('00' + (selectedDate.getMonth() + 1)).slice(-2);
      const YYYY = ('0000' + (selectedDate.getFullYear())).slice(-4);
      return `${DD}/${MM}/${YYYY}`;
    } else {
      return 'DD/MM/YYYY';
    }
  });

  return <FieldInternalWrapper
    name={props.name}
    errors={errors}
    isDisabled={disabled()}
    helperText={props.helperText}
  >
    <InputContainer
      {...elProps}
      id={id()}
      label={props.label}
      focused={focused()}
      color={props.color}
      style={{
        cursor: disabled() === false ? 'pointer' : 'default',
        ...elProps.style
      }}
      disabled={disabled()}
      onClick={e => {
        if (!disabled()) {
          setFocused(focused => !focused)

          if (typeof elProps.onClick === 'function') {
            elProps.onClick(e);
          }
        }
      }}
      icon={
        <CalendarMonth
          variant='rounded'
        />
      }
      hasContent={hasContent()}
      ref={(ref) => {
        if (typeof elProps.ref === 'function') {
          elProps.ref(ref);
        }

        setInputContainerRef(ref);
      }}
    >
      {displayDate()}
    </InputContainer>

    <Dropdown
      for={inputContainerRef()!}
      visible={focused()}
      class='datepicker-dropdown'
      ref={setDropdownRef}
    >
      <Box depth={3} class='datepicker-dropdown-inner'>
        <div class='dropdown-header'>
          <Button.Icon
            size='small'
            class='arrow-previous'
            onClick={handlePrevious}
          >
            <ArrowLeft />
          </Button.Icon>

          <ButtonChooser
            name='dateSelectionType'
            class='selection-type-button-chooser'
            value={datepickerSelectionType()}
            manuallyControlled
            onChange={(v) => {
              if (v === datepickerSelectionType()) {
                setDatepickerSelectionType('day');
              } else {
                setDatepickerSelectionType(v as any);
              }
            }}
          >
            <ButtonChooser.Option
              size='medium'
              class='selection-type-button'
              value='month'
            >
              {monthNames[viewedMonth()]}
            </ButtonChooser.Option>
            <ButtonChooser.Option
              size='medium'
              class='selection-type-button'
              value='year'
            >{viewedYear()}</ButtonChooser.Option>
          </ButtonChooser>

          <Button.Icon
            size='small'
            class='arrow-next'
            onClick={handleNext}
          >
            <ArrowRight />
          </Button.Icon>
        </div>

        <Row class='dropdown-content'>
          <Switch>
            <Match when={datepickerSelectionType() === 'day'}>
              <DatepickerInternalDayPicker
                year={viewedYear()}
                month={viewedMonth()}
                onDayClicked={(newDate) => setValue(newDate)}
                selectedDate={value()!}
              />
            </Match>
            <Match when={datepickerSelectionType() === 'month'}>
              <DatepickerInternalMonthPicker
                year={viewedYear()}
                month={viewedMonth()}
                monthNames={monthNames}
                onMonthClicked={
                  (month) => {
                    setValue(
                      new Date(
                        viewedYear(),
                        month,
                        Math.min(
                          amountOfDaysInMonth(viewedYear(), month),
                          value()?.getDate() || 1
                        )
                      )
                    )
                  }
                }
                selectedDate={value()!}
              />
            </Match>
            <Match when={datepickerSelectionType() === 'year'}>
              <DatepickerIntenralYearPicker
                year={viewedYear()}
                month={viewedMonth()}
                onYearClicked={
                  (year) => {
                    setValue(
                      new Date(
                        year,
                        viewedMonth(),
                        Math.min(
                          amountOfDaysInMonth(year, viewedMonth()),
                          value()?.getDate() || 1
                        )
                      )
                    )
                  }
                }
                selectedDate={value()!}
              />
            </Match>
          </Switch>
        </Row>
      </Box>
    </Dropdown>
  </FieldInternalWrapper>;
};

export default Datepicker;
