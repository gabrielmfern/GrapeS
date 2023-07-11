import { createContext, Setter } from 'solid-js';
import { produce } from 'solid-js/store';

import { deeplyTrack } from '../Helpers/deeplyTrack';
1
import { Store } from '../Helpers/Types/Store';

import { AgnosticValidator } from './Types/AgnosticValidator';
import { FieldValidator } from './Types/FieldValidator';
import { FormValue } from './Types/FormValue';
import { LeavesOfObject } from './Types/LeavesOfObject';
import { DeepGet } from './Types/DeepGet';

export class FormError extends Error { }

/**
  * @example 
  * ```typescript
  * const formStore = createStore<FormStore<MyFormValueType>>(new FormStore({
  *   // all of my default field values
  * }))
  * ```
  */
export class FormStore<
T extends FormValue, 
Values extends FormValue = Partial<T>,
> {
  values: Values;
  /**
    * A array of field names that are currently disabled
    */
  disabled: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string[]>>;
  validators: Partial<Record<string, FieldValidator[]>>;

  constructor(values: Values) {
    this.values = values;
    this.disabled = {};
    this.validators = {};
    this.errors = {};
  }
}

function getByPath(obj: any, path: string | string[]): any {
  const pathArr = Array.isArray(path) ? path : path.split('.');
  const cursorKey = pathArr[0];
  if (typeof obj[cursorKey] === 'object' && path.length > 0) {
    return getByPath(obj[cursorKey], pathArr.slice(1));
  } else {
    return obj[cursorKey];
  }
}

function getLeaves(obj: any): string[] {
  const resultingKeys = [];

  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object' && !(obj[key] instanceof Date)) {
      resultingKeys.push(...getLeaves(obj[key]).map(l => `${key}.${l}`));
    } else {
      resultingKeys.push(key);
    }
  }

  return resultingKeys;
}

function setByPath(obj: any, path: string | string[], value: any): void {
  const pathArr = Array.isArray(path) ? path : path.split('.');
  const cursorKey = pathArr[0];

  if (typeof obj[cursorKey] === 'undefined' && pathArr.length > 1) {
    obj[cursorKey] = {};
  }

  if (typeof obj[cursorKey] === 'object' && pathArr.length > 0) {
    setByPath(obj[cursorKey], pathArr.slice(1), value);
  } else {
    obj[cursorKey] = value;
  }
}

function deepDelete(obj: any, path: string | string[]): void {
  const pathArr = Array.isArray(path) ? path : path.split('.');
  const cursorKey = pathArr[0];

  if (typeof obj[cursorKey] === 'object' && path.length > 0) {
    deepDelete(obj[cursorKey], pathArr.slice(1));
  } else {
    delete obj[cursorKey];
  }
}

/**
  * This is going to be the value that comes from the `useForm()` call to get the data
  * and access to some actions related to the context Form.
  */
export class FormProviderValue<
T extends FormValue, 
Values extends FormValue = Partial<T>,
Leaves extends LeavesOfObject<T> | string = T extends {} ? string : LeavesOfObject<T>,
> {
  private form: FormStore<Values>;
  private setForm: Setter<FormStore<Values>>;

  // this doesn't really need to be reactive
  private __isCleaningUp: boolean;

  constructor(
    public store: Store<FormStore<Partial<Values>>>,
    public agnosticValidators: AgnosticValidator[],
    private _identification: string
  ) {
    this.form = store[0];
    this.setForm = store[1];

    this.__isCleaningUp = false;
  }

  /**
    * @description Weather or not the form context this belongs to is being cleaned up.
    * 
    * This is used so that the values of the fields are persisted once the Form is being cleaned up
    * but are removed if the Form is not being cleaned up.
    */
  get isCleaningUp() {
    return this.__isCleaningUp;
  }

  set isCleaningUp(cleaningUp: boolean) {
    this.__isCleaningUp = cleaningUp;
  }

  identification(): string {
    return this._identification;
  }

  track(): void {
    deeplyTrack(this, ['onFormValueChangeListeners', 'setForm']);
  }

  /**
    * @description Initializes the field inside of the formStore 
    * using the `validators` and the initial `value`.
    *
    * @param name The name that the field is going to hold.
    * This is very important and should be uinque because this is going
    * to be used to identify the field and associate it with the proper element.
    *
    * @param validators A array of `validators`.
    * Validators are basically just functions that either return an error message
    * or nothing based on the value of the field. There are some predefined Validators
    * such as `Validators.required`.
    *
    * @param value Just the initial value of the field being initialized.
    */
  init<Name extends Leaves>(
    name: Name, 
    validators: FieldValidator[], 
    value: DeepGet<Values, Name>
  ): void {
    if (document.querySelectorAll(`#field-${this.identification()}-${name}`).length > 1) {
      throw new FormError(
        `Error with the field "${name}" on the <Form> with identification "${this.identification()}": `
        + 'You cannot have multiple fields defined on the same <Form> that have the same name!'
      );
    }
    this.setForm(produce(form => {
      setByPath(form.values, name, value);
      form.validators[name] = validators;
    }));
  }

  /**
    * @description Removes all of the references inside of the formStore that
    * are associated with the field identified by `name` except for its value.
    */
  cleanUp(name: Leaves): void {
    this.setForm(produce(form => {
      if (!this.isCleaningUp) {
        deepDelete(form.values, name);
      }

      delete form.errors[name];
      delete form.validators[name];
    }));
  }

  /**
    * @description Runs over all of the validators of the field with the specified
    * `name` and adds the errors to the field if necessary, thus making it invalid.
    */
  validate(name: Leaves): void {
    if (this.isDisabled(name)) return;

    const formValueKeys: string[] = getLeaves(this.form.values);
    if (!formValueKeys.includes(name)) {
      throw new FormError(`Cannot validate the field named "${name}" inside of the form with identification` +
        ` ${this.identification()} because it does not exist! 
Maybe you forgot to initialize it?`);
    } else {
      this.setForm(produce(form => {
        const validators = form.validators[name] || [];
        const value = getByPath(form.values, name);
        const errors = validators.map(validator => validator(value)!).flat().filter(Boolean);
        form.errors[name] = errors;
      }));
    }
  }

  /**
    * @description Validates all of the fields and then uses all of the agnostic
    * validators associated with the form.
    */
  validateAll(): boolean {
    this.setForm(produce(form => {
      // the validators just use the field paths for more usability
      const fields = Object.keys(form.validators) as Leaves[];
      const errors: Partial<Record<Leaves, string[]>> = {};

      fields.forEach(field => {
        if (this.isDisabled(field as any)) return;

        const validators = (form.validators as any)[field]!;
        const value = getByPath(form.values, field);
        const caughtErrors = validators.map((validator: FieldValidator) => validator(value)!).flat().filter(Boolean);
        (errors as any)[field] = caughtErrors;
      });

      if (this.agnosticValidators) {
        this.agnosticValidators.forEach(validator => {
          const agnosticValidatorCaughtErrors: Partial<Record<Leaves, string>> = validator(form.values) as any;
          const fieldsWithErrorsCaughtByAgnosticValidator: Leaves[] = Object.keys(agnosticValidatorCaughtErrors) as Leaves[];
          fieldsWithErrorsCaughtByAgnosticValidator.forEach(field => {
            if (this.isDisabled(field)) return;

            if (typeof errors[field] !== 'undefined') {
              errors[field]!.push(agnosticValidatorCaughtErrors[field]!);
            } else {
              errors[field] = [agnosticValidatorCaughtErrors[field]!];
            }
          });
        });
      }

      form.errors = errors;
    }));

    return this.isValid();
  }

  isDisabled(name: Leaves): boolean {
    return this.form.disabled[name] || false;
  }

  setDisabled(name: Leaves, disabled: boolean): void {
    this.setForm(produce(form => {
      form.disabled[name] = disabled;
      form.errors[name] = [];
    }));
  }

  /**
    * @description Checks weather or not the form is valid.
    */
  isValid(): boolean {
    return !this.isInvalid();
  }

  /**
    * @description Checks weather or not the form is invalid.
    */
  isInvalid(): boolean {
    const fieldsWithErrorObject: Leaves[] = Object.keys(this.form.errors) as Leaves[];
    return fieldsWithErrorObject.some(
      (key) => this.form.errors[key]!.length > 0,
    );
  }

  /**
    * @description Gets the first error for the field with the specified
    * `name`.
    */
  firstErrorFor(name: Leaves): string | undefined {
    if (typeof this.form.errors[name] !== 'undefined') {
      return this.form.errors[name]![0];
    }
  }

  getErrors(name: Leaves): string[] | undefined {
    if (typeof this.form.errors[name] === 'undefined') return undefined;

    // traverses through the errors so that Solid tracks them
    // and the return value of this method is reactive
    deeplyTrack(this.form.errors[name]);

    return this.form.errors[name];
  }

  hasErrors(name: Leaves): boolean {
    return typeof this.form.errors[name] !== 'undefined'
      ? typeof this.form.errors[name]![0].length !== 'undefined'
      : false;
  }

  valueFor<Name extends Leaves>(name: Name): DeepGet<Values, Name> | undefined {
    const value = getByPath(this.form.values, name);
    deeplyTrack(value);
    return value;
  }

  update<Name extends Leaves>(name: Name, newValue: DeepGet<Values, Name>): void {
    this.setForm(produce(form => {
      setByPath(form.values, name, newValue);
    }));
  }
}

export const FormContext = createContext<FormProviderValue<FormValue>>();