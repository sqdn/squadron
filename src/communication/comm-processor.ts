import { cxDynamic, CxEntry, cxScoped } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { UnitContext } from '../unit';
import { CommChannel } from './comm-channel';
import { CommHandler, CommReceiver, CommResponder, isCommReceiver } from './comm-handler';
import { CommPacket } from './comm-packet';

export interface CommProcessor {

  receive(command: string, signal: CommPacket, channel: CommChannel): void;

  respond(command: string, request: CommPacket, channel: CommChannel): OnEvent<[CommPacket]>;

}

export const CommProcessor: CxEntry<CommProcessor, CommHandler> = {
  perContext: (/*#__PURE__*/ cxScoped(
      UnitContext,
      (/*#__PURE__*/ cxDynamic({
        create(handlers: CommHandler[], _target: CxEntry.Target<CommProcessor, CommHandler>): CommProcessor {

          const receivers = new Map<string, CommReceiver>();
          const responders = new Map<string, CommResponder>();

          for (const handler of handlers) {
            if (isCommReceiver(handler)) {
              receivers.set(handler.command, handler);
            } else {
              responders.set(handler.command, handler);
            }
          }

          return {
            receive(command, signal: CommPacket, channel: CommChannel) {

              const receiver = receivers.get(command);

              if (!receiver) {
                throw new TypeError(`Unknown command received: ${command}`);
              }

              receiver.receive(signal, channel);
            },
            respond(command: string, request: CommPacket, channel: CommChannel): OnEvent<[CommPacket]> {

              const responder = responders.get(command);

              if (!responder) {
                throw new TypeError(`Unknown request received: ${command}`);
              }

              return responder.respond(request, channel);
            },
          };
        },
        assign({ get, to }) {

          const processor: CommProcessor = {
            receive(command: string, signal: CommPacket, channel: CommChannel) {
              get().receive(command, signal, channel);
            },
            respond(command: string, request: CommPacket, channel: CommChannel) {
              return get().respond(command, request, channel);
            },
          };

          return receiver => to((_, by) => receiver(processor, by));
        },
      })),
  )),
  toString: () => '[CommProcessor]',
};
