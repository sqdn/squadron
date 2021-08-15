import { OnEvent } from '@proc7ts/fun-events';
import { CommChannel } from '../comm-channel';
import { CommPacket } from '../comm-packet';
import { CommProcessor } from '../comm-processor';

/**
 * Inbound communication processor that proxies commands to another one.
 */
export class ProxyCommProcessor implements CommProcessor {

  readonly #get: (this: void) => CommProcessor;

  /**
   * Constructs proxy communication processor.
   *
   * @param getProcessor - Returns communication processor to proxy inbound commands to. The target processor accessed
   * on each request.
   */
  constructor(getProcessor: (this: void) => CommProcessor) {
    this.#get = getProcessor;
  }

  receive(name: string, signal: CommPacket, channel: CommChannel): boolean {
    return this.#get().receive(name, signal, channel);
  }

  respond(name: string, request: CommPacket, channel: CommChannel): OnEvent<[CommPacket]> | false | null | undefined {
    return this.#get().respond(name, request, channel);
  }

}
