import { OnEvent } from '@proc7ts/fun-events';
import { CommPacket } from './comm-packet';

/**
 * Communication commands buffer.
 *
 * Allows to buffer commands and to pull them in the same order as they added. It may evict some of the buffered events.
 *
 * @typeParam T - A type of value associated with command.
 */
export interface CommBuffer<T = unknown> {
  /**
   * A `OnEvent` sender of command eviction events.
   *
   * An eviction event is the value associated with evicted command.
   */
  readonly onEvict: OnEvent<[T]>;

  /**
   * Adds signal to buffer.
   *
   * @param name - Added signal name.
   * @param signal - Added signal packet.
   * @param value - A value associated with the signal.
   */
  addSignal(name: string, signal: CommPacket, value: T): void;

  /**
   * Adds request to buffer.
   *
   * @param name - Added request name.
   * @param request - Added request packet.
   * @param value - A value associated with the request.
   */
  addRequest(name: string, request: CommPacket, value: T): void;

  /**
   * Pulls the earliest added command and removes it from the buffer, if any.
   *
   * @returns The value associated with the earliest command, or `undefined` if there is no commands in the buffer.
   */
  pull(): T | undefined;
}
