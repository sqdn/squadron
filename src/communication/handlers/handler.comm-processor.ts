import { OnEvent } from '@proc7ts/fun-events';
import { CommReceiver, CommResponder } from '../comm-handler';
import { CommPacket } from '../comm-packet';
import { CommProcessor } from '../comm-processor';
import { isCommProcessor, isCommResponder } from './comm-handler.impl';

/**
 * Communication processor that handles inbound commands with matching handlers.
 */
export class HandlerCommProcessor implements CommProcessor {

  readonly #processors: CommProcessor[] = [];
  readonly #receivers = new Map<string, CommProcessor['receive'][]>();
  readonly #responders = new Map<string, CommProcessor['respond'][]>();

  /**
   * Constructs handler communication processor.
   *
   * @param handlers - Communication handlers to process inbound commands with.
   */
  constructor(...handlers: (CommReceiver | CommResponder | CommProcessor)[]) {
    for (const handler of handlers) {
      if (isCommProcessor(handler)) {
        this.#addProcessor(handler);
      } else if (isCommResponder(handler)) {
        this.#respondersOf(handler.name).push((_name, request) => handler.respond(request));
      } else {
        this.#receiversOf(handler.name).push((_name, signal) => handler.receive(signal));
      }
    }
  }

  #addProcessor(processor: CommProcessor): void {
    for (const name of this.#receivers.keys()) {
      this.#receiversOf(name).push(processor.receive.bind(processor));
    }
    for (const name of this.#responders.keys()) {
      this.#respondersOf(name).push(processor.respond.bind(processor));
    }
    this.#processors.push(processor);
  }

  #receiversOf(name: string): CommProcessor['receive'][] {
    let receivers = this.#receivers.get(name);

    if (!receivers) {
      receivers = this.#processors.map(processor => processor.receive.bind(processor));
      this.#receivers.set(name, receivers);
    }

    return receivers;
  }

  #respondersOf(name: string): CommProcessor['respond'][] {
    let responders = this.#responders.get(name);

    if (!responders) {
      responders = this.#processors.map(processor => processor.respond.bind(processor));
      this.#responders.set(name, responders);
    }

    return responders;
  }

  receive(name: string, signal: CommPacket): boolean {
    return this.#receiversOf(name).some(receiver => receiver(name, signal));
  }

  respond(name: string, request: CommPacket): OnEvent<[CommPacket]> | false | null | undefined {
    let response: OnEvent<[CommPacket]> | false | null | undefined;

    for (const responder of this.#respondersOf(name)) {
      response = responder(name, request);
      if (response) {
        break;
      }
    }

    return response;
  }

}
