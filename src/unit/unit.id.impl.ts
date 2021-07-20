import { createHash } from 'crypto';
import { Unit } from './unit';

export const Unit$Id__symbol = (/*#__PURE__*/ Symbol('Unit.id'));

export class Unit$Id {

  stack!: string;
  readonly tag: string;
  private _origin?: string;
  private _uid?: string;

  constructor(readonly unit: Unit, { tag = '' }: Unit.Init = {}) {
    this.tag = tag;
  }

  get name(): string {
    return 'Unit';
  }

  get message(): string {
    return this.unit.constructor.name;
  }

  get origin(): string {
    if (!this._origin) {

      const origin = Unit$origin(this.stack);
      const tag = this.tag;

      this._origin = tag ? `${origin}#${tag}` : origin;
    }

    return this._origin;
  }

  get uid(): string {
    if (!this._uid) {

      const hash = createHash('sha256');

      hash.update(this.stack);

      const stackHash = hash.digest('hex');

      this._uid = this.tag ? `${this.tag}@${stackHash}` : stackHash;
    }

    return this._uid;
  }

}

const Unit$stack$nlPattern = /\n/;
const Unit$stack$originPattern = /\((.+)\)/;

function Unit$origin(stack: string): string {

  const line = stack.split(Unit$stack$nlPattern, 2)[1];

  return Unit$stack$originPattern.exec(line)![1];
}
