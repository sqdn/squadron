import { CommPacket } from '../../communication';

export const UnitLocationCommRequest = 'unit-location';

export interface UnitLocationCommRequest extends CommPacket {

  readonly unit: string;

}

export interface UnitLocationCommResponse extends CommPacket {

  readonly formations: readonly string[];

}
