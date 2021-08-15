import { Unit } from '../../unit';
import { CommReceiver, CommResponder } from '../comm-handler';
import { CommProcessor } from '../comm-processor';
import { CommProtocol } from '../comm-protocol';

/**
 * Inbound communication protocol that proxies commands to another one.
 */
export class ProxyCommProtocol implements CommProtocol {

  readonly #get: (this: void) => CommProtocol;

  /**
   * Constructs proxy communication protocol.
   *
   * @param getProtocol - Returns communication protocol to proxy inbound commands to.
   */
  constructor(getProtocol: (this: void) => CommProtocol) {
    this.#get = getProtocol;
  }

  channelProcessor(source: Unit): CommReceiver | CommResponder | CommProcessor | undefined {
    return this.#get().channelProcessor(source);
  }

}
