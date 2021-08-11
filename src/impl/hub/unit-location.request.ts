import { CommPacket } from '../../communication';

export interface UnitLocationRequest extends CommPacket {

  readonly unit: string;

}

export interface UnitLocationResponse extends CommPacket {

  readonly formations: readonly string[];

}
