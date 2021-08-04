import { MessagePort } from 'worker_threads';
import { CommPacket } from '../comm-packet';

/**
 * A request to start communication by messaging via the given port.
 *
 * Sent from connection initiator to remote formation to provide a port to use for communications.
 *
 * Responded with empty packet confirming the port accepted.
 */
export interface CommMessagingRequest extends CommPacket {

  /**
   * Unique identifier of formation that establishes communication.
   */
  readonly fromFormation: string;

  /**
   * Unique identifier of unit to establish communication to.
   */
  readonly toUnit: string;

  /**
   * Message port to use by established connection.
   */
  readonly port: MessagePort;

}
