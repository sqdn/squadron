import { OnEvent } from '@proc7ts/fun-events';
import { CommChannel } from '../comm-channel';
import { CommHandler, CommReceiver, CommResponder } from '../comm-handler';
import { CommPacket } from '../comm-packet';
import { CommProcessor } from '../comm-processor';

/**
 * Communication processor that handles inbound commands with matching handlers.
 */
export class HandlerCommProcessor implements CommProcessor {

  readonly #receivers = new Map<string, CommReceiver[]>();
  readonly #responders = new Map<string, CommResponder[]>();

  /**
   * Constructs handler communication processor.
   *
   * @param handlers - Communication handlers to process inbound commands with.
   */
  constructor(...handlers: CommHandler[]) {
    for (const handler of handlers) {
      if (isCommReceiver(handler)) {
        this.#addReceiver(handler);
      } else {
        this.#addResponder(handler);
      }
    }
  }

  #addReceiver(handler: CommReceiver): void {

    const receivers = this.#receivers.get(handler.name);

    if (receivers) {
      receivers.push(handler);
    } else {
      this.#receivers.set(handler.name, [handler]);
    }
  }

  #addResponder(responder: CommResponder): void {

    const responders = this.#responders.get(responder.name);

    if (responders) {
      responders.push(responder);
    } else {
      this.#responders.set(responder.name, [responder]);
    }
  }

  receive(name: string, signal: CommPacket, channel: CommChannel): boolean {

    const receivers = this.#receivers.get(name);

    return !!receivers && receivers.some(receiver => receiver.receive(signal, channel));
  }

  respond(name: string, request: CommPacket, channel: CommChannel): OnEvent<[CommPacket]> | false | null | undefined {

    let response: OnEvent<[CommPacket]> | false | null | undefined;
    const responders = this.#responders.get(name);

    if (responders) {
      for (const responder of responders) {
        response = responder.respond(request, channel);
        if (response) {
          break;
        }
      }
    }

    return response;
  }

}

function isCommReceiver(handler: CommHandler): handler is CommReceiver {
  return typeof (handler as Partial<CommReceiver>).receive === 'function';
}
