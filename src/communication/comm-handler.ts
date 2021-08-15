import { OnEvent } from '@proc7ts/fun-events';
import { CommPacket } from './comm-packet';
import { CommProcessor } from './comm-processor';
import { CommProtocol } from './comm-protocol';

/**
 * Inbound command handler.
 *
 * One of:
 *
 * - signal {@link CommReceiver receiver},
 * - request {@link CommResponder responder},
 * - command {@link CommProcessor processor}, or
 * - communication {@link CommProtocol protocol}.
 *
 * A {@link Communicator} processes incoming commands by handlers available in unit context as {@link CommProtocol}.
 */
export type CommHandler =
    | CommReceiver
    | CommResponder
    | CommProcessor
    | CommProtocol;

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
   *
   * @returns Either `true` if the signal processed, or `false` otherwise.
   */
  receive(signal: TSignal): boolean;

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
   *
   * @returns Either `OnEvent` sender of response data packets, or falsy value if the request can not be responded.
   */
  respond(request: TRequest): OnEvent<[TResponse]> | false | null | undefined;

}
