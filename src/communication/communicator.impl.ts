import { UnitLocator } from '../formation';
import { Unit, UnitContext } from '../unit';
import { DirectCommChannel } from './channels';
import { CommChannel } from './comm-channel';
import { CommProcessor } from './comm-processor';
import { Communicator } from './communicator';
import { CommLinker } from './linkage';

export class Communicator$ implements Communicator {

  readonly #locator: UnitLocator;
  readonly #processor: CommProcessor;
  readonly #linker: CommLinker;
  readonly #channels = new Map<string, CommChannel>();

  constructor(context: UnitContext) {
    this.#locator = context.get(UnitLocator);
    this.#processor = context.get(CommProcessor);
    this.#linker = context.get(CommLinker);
  }

  connect(to: Unit): CommChannel {

    const existing = this.#channels.get(to.uid);

    if (existing) {
      return existing;
    }

    const location = this.#locator.locateUnit(to);
    let channel: CommChannel;

    if (location.isLocal) {
      channel = new DirectCommChannel({ to, processor: this.#processor });
    } else {

      const { formations } = location;

      if (!formations.length) {
        throw new TypeError(`${to} is not deployed`);
      }

      const formation = formations[Math.floor(Math.random() * formations.length)];
      const link = this.#linker.link(formation);

      channel = link.connect(to);
    }

    this.#channels.set(to.uid, channel);
    channel.supply.whenOff(() => {
      this.#channels.delete(to.uid);
    });

    return channel;
  }

}
