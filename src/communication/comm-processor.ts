import { cxDynamic, CxEntry, cxScoped } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { UnitContext } from '../unit';
import { CommChannel } from './comm-channel';
import { CommHandler } from './comm-handler';
import { CommPacket } from './comm-packet';
import { HandlerCommProcessor, ProxyCommProcessor } from './handlers';

/**
 * Inbound communication processor.
 *
 * Unit {@link Communicator} handles inbound commands with command processor provided for unit context.
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
   * @param channel - Communication channel the signal received from.
   *
   * @returns Either `true` if the signal processed, or `false` if unknown signal received.
   */
  receive(name: string, signal: CommPacket, channel: CommChannel): boolean;

  /**
   * Responds to request received.
   *
   * May skip request processing. In this case a `false`, `null`, or `undefined` value should be returned. The next
   * responder in processing chain will receive the request then.
   *
   * @param name - Received request name.
   * @param request - Received request data packet.
   * @param channel - Communication channel the request received from.
   *
   * @returns Either `OnEvent` sender of response data packets, or falsy value if unknown request received.
   */
  respond(name: string, request: CommPacket, channel: CommChannel): OnEvent<[CommPacket]> | false | null | undefined;

}

/**
 * Unit context entry containing inbound communication processor used by default.
 */
export const CommProcessor: CxEntry<CommProcessor, CommHandler> = {
  perContext: (/*#__PURE__*/ cxScoped(
      UnitContext,
      (/*#__PURE__*/ cxDynamic({
        create(handlers: CommHandler[], _target: CxEntry.Target<CommProcessor, CommHandler>): CommProcessor {
          return new HandlerCommProcessor(...[...handlers].reverse());
        },
        assign({ get, to }) {

          const processor = new ProxyCommProcessor(get);

          return receiver => to((_, by) => receiver(processor, by));
        },
      })),
  )),
  toString: () => '[CommProcessor]',
};
