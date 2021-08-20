import { createHash } from 'crypto';
import { Unit } from './unit';

export const Unit$Id__symbol = (/*#__PURE__*/ Symbol('Unit.id'));

export class Unit$Id {

  stack!: string;
  readonly #tag: string;
  #origin?: string;
  #uid?: string;

  constructor(readonly unit: Unit, { tag = '', id }: Unit.Init) {
    this.#tag = tag;
    if (id) {
      this.#uid = tag ? `${tag}@${id}` : id;
    }
  }

  get name(): string {
    return 'Unit';
  }

  get message(): string {
    return this.unit.constructor.name;
  }

  get location(): string {
    if (!this.#origin) {

      const origin = Unit$location(this.stack);
      const tag = this.#tag;

      this.#origin = tag ? `${origin}#${tag}` : origin;
    }

    return this.#origin;
  }

  get uid(): string {
    if (!this.#uid) {

      const hash = createHash('sha256');

      hash.update(this.stack);

      const stackHash = hash.digest('hex');

      this.#uid = this.#tag ? `${this.#tag}@${stackHash}` : stackHash;
    }

    return this.#uid;
  }

}

const Unit$stack$nlPattern = /\n/;
const Unit$stack$locationPattern = /^\s*at\s+(?:.*\((.*)\)|(.*[^)]))$/;

function Unit$location(stack: string): string {

  const line = stack.split(Unit$stack$nlPattern, 2)[1];
  const result = Unit$stack$locationPattern.exec(line);

  return result![1];
}
