import { createHash } from 'crypto';
import { Unit } from './unit';

export const Unit$Id__symbol = (/*#__PURE__*/ Symbol('Unit.id'));

export class Unit$Id {

  stack!: string;
  readonly prefix: string;
  #suffix?: string;
  #uid?: string;
  #sourceLink?: string;

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
    return this.#suffix ??= Unit$Id$suffix(this.stack);
  }

  get uid(): string {
    return this.#uid ??= `${this.prefix}${this.suffix}`;
  }

  get sourceLink(): string {
    return this.#sourceLink ??= Unit$sourceLink(this.stack);
  }

}

function Unit$Id$suffix(stack: string): string {

  const hash = createHash('sha256');

  hash.update(stack);

  return hash.digest('hex');
}

const Unit$stack$nlPattern = /\n/;
const Unit$stack$sourceLinkPattern = /^\s*at\s+(?:.*\((.*)\)|(.*[^)]))$/;

function Unit$sourceLink(stack: string): string {

  const line = stack.split(Unit$stack$nlPattern, 2)[1];
  const result = Unit$stack$sourceLinkPattern.exec(line);

  return result![1];
}
