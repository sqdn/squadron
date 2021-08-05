import { Formation$Host } from '../impl';
import { Unit, UnitContext } from '../unit';
import { CommChannel } from './comm-channel';
import { CommMethod } from './comm-method';
import { Communicator } from './communicator';

export class Communicator$ implements Communicator {

  readonly #unit: Unit;
  readonly #host: Formation$Host;
  readonly #method: CommMethod;
  readonly #channels = new Map<string, CommChannel>();

  constructor(context: UnitContext) {
    this.#unit = context.unit;
    this.#host = context.get(Formation$Host);
    this.#method = context.get(CommMethod);
  }

  connect(to: Unit): CommChannel {

    const existing = this.#channels.get(to.uid);

    if (existing) {
      return existing;
    }

    const at = this.#host.unitFormations(to);
    const channel = this.#method.connect({
      from: this.#unit,
      to,
      at,
    });

    if (!channel) {
      throw new TypeError(`${this.#unit} can not connect to ${to}`);
    }

    this.#channels.set(to.uid, channel);
    channel.supply.whenOff(() => {
      this.#channels.delete(to.uid);
    });

    return channel;
  }

}
