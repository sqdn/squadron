import { createHash } from 'crypto';

const Unit$Internals__symbol = (/*#__PURE__*/ Symbol('Unit.internals'));

export abstract class Unit<TUnit extends Unit<TUnit>> {

  private readonly [Unit$Internals__symbol]: Unit$Internals<TUnit>;

  constructor(init?: Unit.Init) {
    Error.captureStackTrace(
        this[Unit$Internals__symbol] = new Unit$Internals(this as Unit<TUnit> as TUnit, init),
        new.target,
    );
  }

  get origin(): string {
    return this[Unit$Internals__symbol].origin;
  }

  get tag(): string {
    return this[Unit$Internals__symbol].tag;
  }

  get uid(): string {
    return this[Unit$Internals__symbol].uid;
  }

  get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  toString(): string {
    return `${this[Symbol.toStringTag]}-${this.uid}(${this.origin})`;
  }

}

export namespace Unit {

  export interface Init {

    readonly tag?: string;

  }

}

class Unit$Internals<TUnit extends Unit<TUnit>> {

  stack!: string;
  readonly tag: string;
  private _origin?: string;
  private _uid?: string;

  constructor(readonly unit: TUnit, { tag = '' }: Unit.Init = {}) {
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
      this._origin = Unit$origin(this.stack);
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
