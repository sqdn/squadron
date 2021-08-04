import { MessagePort } from 'worker_threads';
import { CommPacket } from '../comm-packet';

/**
 * A request for message port to use by {@link CommLink communication link}.
 *
 * Responded with {@link MessageCommLinkResponse}.
 */
export interface MessageCommLinkRequest extends CommPacket {

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
 * Response on {@link MessageCommLinkRequest} containing communication port to use.
 */
export interface MessageCommLinkResponse extends CommPacket {

  /**
   * Message port to use by established communication link.
   */
  readonly port: MessagePort;

}
