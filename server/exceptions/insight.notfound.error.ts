/**
 * Exception thrown when an insight cannot be found.
 *
 * @extends Error
 * @example
 * throw new InsightNotFoundError('Insight with ID 123 not found');
 */
export class InsightNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsightNotFoundException";
  }
}
