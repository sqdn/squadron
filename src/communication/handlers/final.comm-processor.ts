import { OnEvent, onEventBy } from '@proc7ts/fun-events';
import { CommPacket } from '../comm-packet';
import { CommProcessor } from '../comm-processor';

/**
 * Inbound communication processor, final in processing chain.
 *
 * Its methods raise errors if is not able to process a command.
 */
export class FinalCommProcessor implements CommProcessor {

  readonly #processor: CommProcessor;

  /**
   * Constructs final communication processor.
   *
   * @param processor - Processor to handle inbound commands by.
   */
  constructor(processor: CommProcessor) {
    this.#processor = processor;
  }

  /**
   * Handles received signal.
   *
   * Never skips signal processing
   *
   * @param name - Received signal name.
   * @param signal - Received signal data packet.
   *
   * @returns Either `true`.
   * @throws TypeError  If unknown signal received.
   */
  receive(name: string, signal: CommPacket): true {
    if (!this.#processor.receive(name, signal)) {
      throw new TypeError(`Unknown signal received: "${name}"`);
    }

    return true;
  }

  /**
   * Responds to request received.
   *
   * Never skips request processing.
   *
   * @param name - Received request name.
   * @param request - Received request data packet.
   *
   * @returns `OnEvent` sender of response data packets. If unknown request received, the response supply wil be cut off
   * with `TypeError` as its reason.
   */
  respond(name: string, request: CommPacket): OnEvent<[CommPacket]> {
    return (
      this.#processor.respond(name, request)
      || onEventBy(({ supply }) => {
        supply.off(new TypeError(`Unknown request received: "${name}"`));
      })
    );
  }

}
