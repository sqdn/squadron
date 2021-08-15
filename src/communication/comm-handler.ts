import { OnEvent } from '@proc7ts/fun-events';
import { CommChannel } from './comm-channel';
import { CommPacket } from './comm-packet';
import { CommProcessor } from './comm-processor';

/**
 * Inbound command handler.
 *
 * One of:
 *
 * - signal {@link CommReceiver receiver},
 * - request {@link CommResponder responder},
 * - or command {@link CommProcessor processor}.
 *
 * A {@link Communicator} processes incoming commands by handlers available in unit context as {@link CommProcessor}.
 */
export type CommHandler =
    | CommReceiver
    | CommResponder
    | CommProcessor;

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
   * May skip signal processing. In this case a `false` value should be returned. The next receiver in processing chain
   * will receive the signal then.
   *
   * @param signal - Received signal data packet.
   * @param channel - Communication channel the signal received from.
   *
   * @returns Either `true` if the signal processed, or `false` otherwise.
   */
  receive(signal: TSignal, channel: CommChannel): boolean;

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
   * May skip request processing. In this case a `false`, `null`, or `undefined` value should be returned. The next
   * responder in processing chain will receive the request then.
   *
   * @param request - Received request data packet.
   * @param channel - Communication channel the request received from.
   *
   * @returns Either `OnEvent` sender of response data packets, or falsy value if the request can not be responded.
   */
  respond(request: TRequest, channel: CommChannel): OnEvent<[TResponse]> | false | null | undefined;

}
