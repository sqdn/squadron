import { TransferListItem } from 'node:worker_threads';

/**
 * Communication packet containing command body and meta information.
 *
 * Command meta is stored in {@link meta} property. Other properties contain command body.
 */
export interface CommPacket {

  /**
   * Command meta, if present.
   */
  readonly meta?: CommPacketMeta | undefined;

}

/**
 * Communication command meta information.
 *
 * This is an object containing arbitrary fields. Some of them reserved.
 */
export interface CommPacketMeta {

  /**
   * Array of objects to transfer with [postMessage] call.
   *
   * [postMessage]: https://nodejs.org/dist/latest-v12.x/docs/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist
   */
  readonly transferList?: readonly TransferListItem[] | undefined;

  /**
   * Command sequence stream identifier.
   *
   * This value is the same for both request and response.
   */
  readonly streamId?: string | undefined;

  readonly [name: string]: unknown | undefined;

}
