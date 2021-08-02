import { OnEvent, onEventBy } from '@proc7ts/fun-events';
import { CommChannel } from '../comm-channel';
import { CommHandler, CommReceiver, CommResponder } from '../comm-handler';
import { CommPacket } from '../comm-packet';
import { CommProcessor } from '../comm-processor';

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
        throw new TypeError(`Unknown signal received: "${name}"`);
      }

      receiver.receive(signal, channel);
    },
    respond(name: string, request: CommPacket, channel: CommChannel): OnEvent<[CommPacket]> {

      const responder = responders.get(name);

      if (!responder) {
        return onEventBy(({ supply }) => {
          supply.off(new TypeError(`Unknown request received: "${name}"`));
        });
      }

      return responder.respond(request, channel);
    },
  };
}

function isCommReceiver(handler: CommHandler): handler is CommReceiver {
  return typeof (handler as Partial<CommReceiver>).receive === 'function';
}
