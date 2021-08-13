import { Unit, UnitContext } from '../unit';

export type OrderTask<TUnit extends Unit> =
    (this: void, context: UnitContext<TUnit>) => void | PromiseLike<unknown>;
