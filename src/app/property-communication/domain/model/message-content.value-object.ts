/** Text of a message: between 1 and 2000 characters. */
export class MessageContent {
  static readonly maxLength = 2000;

  readonly value: string;

  constructor(value: string) {
    if (!MessageContent.isValid(value)) throw new Error('Invalid message content');
    this.value = value.trim();
  }

  static isValid(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= MessageContent.maxLength;
  }
}
