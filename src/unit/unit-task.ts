import { Unit } from './unit';
import { UnitContext } from './unit-context';

export type UnitTask<TUnit extends Unit> =
    (this: void, context: UnitContext<TUnit>) => void | PromiseLike<unknown>;
