import { isPresent } from '@proc7ts/primitives';
import { Unit } from '../../unit';
import { CommHandler, CommReceiver, CommResponder } from '../comm-handler';
import { CommProcessor } from '../comm-processor';
import { CommProtocol } from '../comm-protocol';
import { HandlerCommProcessor } from './handler.comm-processor';

/**
 * Communication protocol that handles inbound commands with matching handlers.
 */
export class HandlerCommProtocol implements CommProtocol {

  readonly #handlers: CommHandler[];

  /**
   * Constructs handler communication protocol.
   *
   * @param handlers - Communication handlers to process inbound commands with.
   */
  constructor(...handlers: CommHandler[]) {
    this.#handlers = handlers;
  }

  channelProcessor(source: Unit): CommReceiver | CommResponder | CommProcessor | undefined {

    const handlers = this.#handlers.map(handler => CommProcessor$forUnit(source, handler))
        .filter<CommReceiver | CommResponder | CommProcessor>(isPresent);

    return handlers.length
        ? (handlers.length > 1
            ? new HandlerCommProcessor(...handlers)
            : handlers[0])
        : undefined;
  }

}

function isCommProtocol(handler: CommHandler): handler is CommProtocol {
  return typeof (handler as Partial<CommProtocol>).channelProcessor === 'function';
}

function CommProcessor$forUnit(
    source: Unit,
    handler: CommHandler,
): CommReceiver | CommResponder | CommProcessor | undefined {
  return isCommProtocol(handler) ? handler.channelProcessor(source) : handler;
}
