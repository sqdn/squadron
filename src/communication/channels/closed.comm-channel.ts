import { OnEvent, onEventBy } from '@proc7ts/fun-events';
import { noop } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { Unit } from '../../unit';
import { CommChannel } from '../comm-channel';
import { CommError } from '../comm-error';
import { CommPacket } from '../comm-packet';

/**
 * Closed communication channel.
 *
 * Raises {@link CommError communication error} on attempt to send any command.
 */
export class ClosedCommChannel implements CommChannel {

  readonly #to: Unit;
  readonly #reason: unknown;

  /**
   * Constructs closed communication channel.
   *
   * @param to - Remote unit the channel closed to.
   * @param reason - Optional reason why the channel closed.
   */
  constructor(to: Unit, reason?: unknown) {
    this.#to = to;
    this.#reason = reason;
  }

  get to(): Unit {
    return this.#to;
  }

  get supply(): Supply {
    return new Supply(noop).off(this.#reason);
  }

  signal<TSignal extends CommPacket>(name: string, _signal: TSignal): void {
    throw new CommError(
        this.to,
        `Can not send signal "${name}" to ${this.#to} over closed channel`,
        this.#reason,
    );
  }

  request<TRequest extends CommPacket, TResponse = CommPacket>(name: string, _request: TRequest): OnEvent<[TResponse]> {
    return onEventBy(({ supply }) => supply.off(new CommError(
        this.to,
        `Can not send request "${name}" to ${this.#to} over closed channel`,
        this.#reason,
    )));
  }

}
