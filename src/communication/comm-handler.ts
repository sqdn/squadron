import { OnEvent } from '@proc7ts/fun-events';
import { CommChannel } from './comm-channel';
import { CommPacket } from './comm-packet';

/**
 * Inbound command handler.
 *
 * Either a signal receiver, or a request responder.
 *
 * A {@link Communicator} processes incoming commands by available handlers. Available handlers provided in unit context
 * available via {@link CommProcessor}.
 *
 * @typeParam TIn - Input packet type.
 * @typeParam TOut - Output packet type.
 */
export type CommHandler<TIn extends CommPacket = CommPacket, TOut extends CommPacket | void = CommPacket> =
    | CommReceiver<TIn>
    | (TOut extends CommPacket ? CommResponder<TIn, TOut> : never);

/**
 * Inbound {@link CommChannel.signal signal} receiver.
 *
 * @typeParam TSignal - Supported signal packet type.
 */
export interface CommReceiver<TSignal extends CommPacket = CommPacket> {

  /**
   * Signal name to handle by this receiver.
   */
  readonly name: string;

  /**
   * Handles received signal.
   *
   * @param signal - Received signal data packet.
   * @param channel - Communication channel the signal received from.
   */
  receive(signal: TSignal, channel: CommChannel): void;

}

/**
 * Inbound {@link CommChannel.request request} responder.
 *
 * @typeParam TRequest - Supported request packet type.
 * @typeParam TResponse - Supported response packet type.
 */
export interface CommResponder<TRequest extends CommPacket = CommPacket, TResponse extends CommPacket = CommPacket> {

  /**
   * Request name to respond.
   */
  readonly name: string;

  /**
   * Responds to request received.
   *
   * @param request - Received request data packet.
   * @param channel - Communication channel the request received from.
   *
   * @returns `OnEvent` sender of response data packets.
   */
  respond(request: TRequest, channel: CommChannel): OnEvent<[TResponse]>;

}
