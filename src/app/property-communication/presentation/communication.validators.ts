import { ValidatorFn } from '@angular/forms';

/** A text that only has spaces counts as empty, as the domain trims it. */
export const notBlankValidator: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.length > 0 && !control.value.trim()
    ? { required: true }
    : null;
