import { FormFieldValue } from './Types/FormFieldValue';

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;

/**
  * A object containing some useful and predefined validators
  * for Grape's fields
  */
const Validators = {
  /**
    * Validates weather or not the field is undefined, null, empty when trimmed 
    * or if being an array is also empty.
    */
  required: (value: FormFieldValue) => (typeof value === 'undefined')
    || (value === null)
    || (typeof value === 'string' && value.trim().length === 0)
    || (Array.isArray(value) && value.length === 0)
    ? 'This is a required field!'
    : undefined,

  /**
    * Validates weather or not the field matches a Regex email.
    * 
    * Regex: `/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g`
    */
  email: (value: FormFieldValue) => (typeof value === 'undefined')
    || (value === null)
    || emailRegex.test(value.toString().trim())
    ? 'This is not a valid email!'
    : undefined,

  isEqual: (expectedValue: FormFieldValue) => (
    (value: FormFieldValue) => value !== expectedValue
      ? `This is expected to be ${expectedValue}!`
      : undefined

  ),
  /**
    * Validates weather or not the current value of the field is >= than a given `minimum`.
    */
  minEq: (minimum: number) => 
    (value: FormFieldValue) => (typeof value === 'number') 
      ? (value! >= minimum
          ? undefined
          : `The minimmum value for this is ${minimum}!`)
      : undefined,
  /**
    * Validates weather or not the current value of the field is <= than a given `maximum`.
    */
  maxEq: (maximum: number) => 
    (value: FormFieldValue) => (typeof value === 'number') 
      ? (value <= maximum
          ? undefined
          : `The maximum value for this is ${maximum}!`)
      : undefined,
}

export default Validators;
