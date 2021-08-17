import { CommPacket } from '../../communication';

export const UnitLocationCommRequest = 'unit-location' as const;

export interface UnitLocationCommRequest extends CommPacket {

  readonly unit: string;

}

export interface UnitLocationCommResponse extends CommPacket {

  readonly formations: readonly string[];

}
