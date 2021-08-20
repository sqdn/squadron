import { createHash } from 'crypto';
import { Unit } from './unit';

export const Unit$Id__symbol = (/*#__PURE__*/ Symbol('Unit.id'));

export class Unit$Id {

  stack!: string;
  readonly prefix: string;
  #suffix?: string;
  #uid?: string;
  #location?: string;

  constructor(readonly unit: Unit, { tag = '', id }: Unit.Init) {
    if (id) {

      const atIdx = id.lastIndexOf('@');

      if (tag) {
        if (atIdx < 0) {
          this.prefix = `${tag}@`;
          this.#suffix = id;
        } else {
          this.prefix = `${tag}@${id.slice(0, atIdx + 1)}`;
          this.#suffix = id.slice(atIdx + 1);
        }
      } else if (atIdx < 0) {
        this.prefix = '';
        this.#suffix = id;
      } else {
        this.prefix = id.slice(0, atIdx + 1);
        this.#suffix = id.slice(atIdx + 1);
      }
    } else {
      this.prefix = tag ? `${tag}@` : '';
    }
  }

  get name(): string {
    return 'Unit';
  }

  get message(): string {
    return this.unit.constructor.name;
  }

  get suffix(): string {
    if (!this.#suffix) {

      const hash = createHash('sha256');

      hash.update(this.stack);

      this.#suffix = hash.digest('hex');
    }

    return this.#suffix;
  }

  get uid(): string {
    return this.#uid ??= `${this.prefix}${this.suffix}`;
  }

  get location(): string {
    if (!this.#location) {
      this.#location = Unit$location(this.stack);
    }

    return this.#location;
  }

}

const Unit$stack$nlPattern = /\n/;
const Unit$stack$locationPattern = /^\s*at\s+(?:.*\((.*)\)|(.*[^)]))$/;

function Unit$location(stack: string): string {

  const line = stack.split(Unit$stack$nlPattern, 2)[1];
  const result = Unit$stack$locationPattern.exec(line);

  return result![1];
}
