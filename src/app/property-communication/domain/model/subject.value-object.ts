/** Subject of a conversation: between 1 and 200 characters. */
export class Subject {
  static readonly maxLength = 200;

  readonly value: string;

  constructor(value: string) {
    if (!Subject.isValid(value)) throw new Error(`Invalid subject: ${value}`);
    this.value = value.trim();
  }

  static isValid(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= Subject.maxLength;
  }
}
