import { OnEvent } from '@proc7ts/fun-events';
import { CommReceiver, CommResponder } from './comm-handler';
import { CommPacket } from './comm-packet';
import { HandlerCommProcessor, NoopCommProcessor } from './handlers';
import { isCommProcessor } from './handlers/comm-handler.impl';

/**
 * Inbound communication processor.
 *
 * Can be constructed out of {@link CommHandler command handlers} as {@link HandlerCommProcessor}.
 */
export interface CommProcessor {

  /**
   * Handles received signal.
   *
   * May skip signal processing. In this case a `false` value should be returned. The next receiver in processing chain
   * will receive the signal then.
   *
   * @param name - Received signal name.
   * @param signal - Received signal data packet.
   *
   * @returns Either `true` if the signal processed, or `false` if unknown signal received.
   */
  receive(name: string, signal: CommPacket): boolean;

  /**
   * Responds to request received.
   *
   * May skip request processing. In this case a `false`, `null`, or `undefined` value should be returned. The next
   * responder in processing chain will receive the request then.
   *
   * @param name - Received request name.
   * @param request - Received request data packet.
   *
   * @returns Either `OnEvent` sender of response data packets, or falsy value if unknown request received.
   */
  respond(name: string, request: CommPacket): OnEvent<[CommPacket]> | false | null | undefined;

}

/**
 * Converts inbound command handler to processor.
 *
 * @param handler - Handler to convert.
 *
 * @returns Communication processor.
 */
export function commProcessorBy(handler?: CommReceiver | CommResponder | CommProcessor): CommProcessor {
  if (!handler) {
    return NoopCommProcessor;
  }
  if (isCommProcessor(handler)) {
    return handler;
  }
  return new HandlerCommProcessor(handler);
}
