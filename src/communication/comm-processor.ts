import { cxDynamic, CxEntry, cxScoped } from '@proc7ts/context-values';
import { OnEvent, onEventBy } from '@proc7ts/fun-events';
import { UnitContext } from '../unit';
import { CommChannel } from './comm-channel';
import { CommHandler, CommReceiver, CommResponder } from './comm-handler';
import { CommPacket } from './comm-packet';

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
 * Creates inbound communication processor out of communication handlers.
 *
 * @param handlers - Communication handlers to process inbound commands with.
 *
 * t@returns - New communication processor.
 */
export function createCommProcessor(...handlers: CommHandler[]): CommProcessor {

  const receivers = new Map<string, CommReceiver>();
  const responders = new Map<string, CommResponder>();

  for (const handler of handlers) {
    if (isCommReceiver(handler)) {
      receivers.set(handler.name, handler);
    } else {
      responders.set(handler.name, handler);
    }
  }

  return {
    receive(name: string, signal: CommPacket, channel: CommChannel): void {

      const receiver = receivers.get(name);

      if (!receiver) {
        throw new TypeError(`Unknown signal received: ${name}`);
      }

      receiver.receive(signal, channel);
    },
    respond(name: string, request: CommPacket, channel: CommChannel): OnEvent<[CommPacket]> {

      const responder = responders.get(name);

      if (!responder) {
        return onEventBy(({ supply }) => {
          supply.off(new TypeError(`Unknown request received: ${name}`));
        });
      }

      return responder.respond(request, channel);
    },
  };
}

/**
 * Creates inbound communication processor that proxies commands to another one.
 *
 * @param getProcessor - Returns communication processor to proxy inbound commands to. The target processor accessed
 * on each request.
 *
 * @returns Proxying communication processor.
 */
export function proxyCommProcessor(getProcessor: (this: void) => CommProcessor): CommProcessor {
  return {
    receive(name: string, signal: CommPacket, channel: CommChannel): void {
      getProcessor().receive(name, signal, channel);
    },
    respond(name: string, request: CommPacket, channel: CommChannel): OnEvent<[CommPacket]> {
      return getProcessor().respond(name, request, channel);
    },
  };
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

function isCommReceiver(handler: CommHandler): handler is CommReceiver {
  return typeof (handler as Partial<CommReceiver>).receive === 'function';
}
