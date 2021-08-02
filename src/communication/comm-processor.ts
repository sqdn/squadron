import { cxDynamic, CxEntry, cxScoped } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { UnitContext } from '../unit';
import { CommChannel } from './comm-channel';
import { CommHandler } from './comm-handler';
import { CommPacket } from './comm-packet';
import { createCommProcessor, proxyCommProcessor } from './handlers';

/**
 * Inbound communication processor.
 *
 * Unit {@link Communicator} handles inbound commands with command processor provided for unit context.
 *
 * Can be constructed out of {@link CommHandler command handlers} by {@link createCommProcessor} function.
 */
export interface CommProcessor {

  /**
   * Handles received signal.
   *
   * @param name - Received signal name.
   * @param signal - Received signal data packet.
   * @param channel - Communication channel the signal received from.
   */
  receive(name: string, signal: CommPacket, channel: CommChannel): void;

  /**
   * Responds to request received.
   *
   * @param name - Received request name.
   * @param request - Received request data packet.
   * @param channel - Communication channel the request received from.
   *
   * @returns `OnEvent` sender of response data packets.
   */
  respond(name: string, request: CommPacket, channel: CommChannel): OnEvent<[CommPacket]>;

}

/**
 * Unit context entry containing inbound communication processor used by default.
 */
export const CommProcessor: CxEntry<CommProcessor, CommHandler> = {
  perContext: (/*#__PURE__*/ cxScoped(
      UnitContext,
      (/*#__PURE__*/ cxDynamic({
        create(handlers: CommHandler[], _target: CxEntry.Target<CommProcessor, CommHandler>): CommProcessor {
          return createCommProcessor(...handlers);
        },
        assign({ get, to }) {

          const processor = proxyCommProcessor(get);

          return receiver => to((_, by) => receiver(processor, by));
        },
      })),
  )),
  toString: () => '[CommProcessor]',
};
