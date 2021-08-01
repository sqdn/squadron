import { OnEvent, supplyOn } from '@proc7ts/fun-events';
import { Supply } from '@proc7ts/supply';
import { Unit } from '../../unit';
import { CommChannel } from '../comm-channel';
import { CommPacket } from '../comm-packet';
import { CommProcessor } from '../comm-processor';
import { ClosedCommChannel } from './closed.comm-channel';

/**
 * Direct communication channel.
 *
 * Processes commands by the given processor instead of sending them somewhere else.
 */
export class DirectCommChannel implements CommChannel {

  readonly #to: Unit;
  readonly #supply: Supply;
  #processor: CommProcessor;

  /**
   * Constructs direct communication channel.
   *
   * @param to - Remote unit to open channel to.
   * @param supply - Communication channel supply. A new one will be created by default.
   * @param processor - Communication processor of the commands sent by constructed channel.
   */
  constructor(
      {
        to,
        supply = new Supply(),
        processor,
      }: {
        to: Unit;
        supply?: Supply;
        processor: CommProcessor;
      },
  ) {
    this.#to = to;
    this.#supply = supply;
    this.#processor = processor;
    this.supply.whenOff(reason => {

      const closed = new ClosedCommChannel(this.to, reason);

      this.#processor = {
        receive(name, signal, _channel) {
          closed.signal(name, signal);
        },
        respond(name, request, _channel) {
          return closed.request(name, request);
        },
      };
    });
  }

  get to(): Unit {
    return this.#to;
  }

  get supply(): Supply {
    return this.#supply;
  }

  signal<TSignal extends CommPacket>(name: string, signal: TSignal): void {
    this.#processor.receive(name, signal, this);
  }

  request<TRequest extends CommPacket, TResponse = CommPacket>(name: string, request: TRequest): OnEvent<[TResponse]> {

    const onResponse = this.#processor.respond(name, request, this) as OnEvent<[TResponse]>;

    return this.supply.isOff
        ? onResponse
        : onResponse.do(supplyOn(this));
  }

}
