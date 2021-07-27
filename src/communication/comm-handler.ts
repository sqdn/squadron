import { OnEvent } from '@proc7ts/fun-events';
import { CommChannel } from './comm-channel';
import { CommPacket } from './comm-packet';

export type CommHandler<TIn extends CommPacket = CommPacket, TOut extends CommPacket = CommPacket> =
    | CommReceiver<TIn>
    | CommResponder<TIn, TOut>;

export interface CommReceiver<TSignal = CommPacket> {

  readonly command: string;

  receive(signal: TSignal, channel: CommChannel): void;

}

export interface CommResponder<TRequest extends CommPacket = CommPacket, TResponse extends CommPacket = CommPacket> {

  readonly command: string;

  respond(request: TRequest, channel: CommChannel): OnEvent<[TResponse]>;

}

export function isCommReceiver(handler: CommHandler): handler is CommReceiver {
  return typeof (handler as Partial<CommReceiver>).receive === 'function';
}
