import { MessagePort } from 'node:worker_threads';
import { CommPacket } from '../../communication';

export const LinkMessagePortCommRequest = 'link-message-port' as const;

/**
 * A request for message port to use by {@link CommLink communication link}.
 *
 * Responded with {@link LinkMessagePortCommResponse}.
 */
export interface LinkMessagePortCommRequest extends CommPacket {
  /**
   * Identifier of formation that opens link.
   */
  readonly fromFormation: string;

  /**
   * Identifier of formation to open link to.
   */
  readonly toFormation: string;
}

/**
 * Response on {@link LinkMessagePortCommRequest} containing communication port to use.
 */
export interface LinkMessagePortCommResponse extends CommPacket {
  /**
   * Message port to use by established communication link.
   */
  readonly port: MessagePort;
}
