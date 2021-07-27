import { OnEvent } from '@proc7ts/fun-events';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { Unit } from '../unit';
import { CommPacket } from './comm-packet';

export interface CommChannel extends SupplyPeer {

  readonly to: Unit;

  readonly supply: Supply;

  send(command: string, signal: CommPacket): void;

  request(command: string, request: CommPacket): OnEvent<[CommPacket]>;

}
