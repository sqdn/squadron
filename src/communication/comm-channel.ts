import { OnEvent } from '@proc7ts/fun-events';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { Unit } from '../unit';
import { CommPacket } from './comm-packet';

/**
 * Inter-unit communication channel.
 *
 * A communication channel to particular unit can be established with {@link Communicator.connect communicator}. Then
 * it can be used to send {@link CommPacket data packets} to target unit.
 */
export interface CommChannel extends SupplyPeer {

  /**
   * Remote unit the channel is opened to.
   */
  readonly to: Unit;

  /**
   * Communication channel supply.
   *
   * Once cut off, communications over this channel stops. The channel renders unusable after that.
   */
  readonly supply: Supply;

  /**
   * Sends a signal to target unit.
   *
   * Signals don't expect any response.
   *
   * The data packet send with signal should correspond to
   *
   * @typeParam TSignal - Signal packet type.
   * @param name - Name of the signal to send.
   * @param signal - Signal data packet to send.
   */
  signal<TSignal extends CommPacket>(name: string, signal: TSignal): void;

  /**
   * Sends a request to target unit.
   *
   * The request is actually sent on response receiver registration.
   *
   * @typeParam TRequest - Request packet type.
   * @typeParam TResponse - Response packet type.
   * @param name - Name of request to send.
   * @param request - Request data packet to send.
   *
   * @returns An `OnEvent` sender of responses.
   */
  request<TRequest extends CommPacket, TResponse = CommPacket>(name: string, request: TRequest): OnEvent<[TResponse]>;

}
