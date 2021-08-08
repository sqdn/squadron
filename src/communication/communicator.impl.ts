import { mapOn_, OnEvent } from '@proc7ts/fun-events';
import { Logger } from '@proc7ts/logger';
import { UnitLocator } from '../formation';
import { Unit, UnitContext } from '../unit';
import { DirectCommChannel, ProxyCommChannel } from './channels';
import { CommChannel } from './comm-channel';
import { CommProcessor } from './comm-processor';
import { Communicator } from './communicator';
import { CommLinker } from './linkage';

export class Communicator$ implements Communicator {

  readonly #locator: UnitLocator;
  readonly #processor: CommProcessor;
  readonly #linker: CommLinker;
  readonly #logger: Logger;
  readonly #channels = new Map<string, CommChannel>();

  constructor(context: UnitContext) {
    this.#locator = context.get(UnitLocator);
    this.#processor = context.get(CommProcessor);
    this.#linker = context.get(CommLinker);
    this.#logger = context.get(Logger);
  }

  connect(to: Unit): CommChannel {

    const existing = this.#channels.get(to.uid);

    if (existing) {
      return existing;
    }

    const onLocation = this.#locator.locateUnit(to);
    const target: OnEvent<[CommChannel]> = onLocation.do(
        mapOn_(location => {
          if (location.isLocal) {
            return new DirectCommChannel({ to, processor: this.#processor });
          }

          const { formations } = location;

          if (!formations.length) {
            throw new TypeError(`${to} is not deployed`);
          }

          const formation = formations[Math.floor(Math.random() * formations.length)];
          const link = this.#linker.link(formation);

          return link.connect(to);
        }),
    );

    const channel = new ProxyCommChannel({ to, target, logger: this.#logger });

    this.#channels.set(to.uid, channel);
    channel.supply.whenOff(() => {
      this.#channels.delete(to.uid);
    });

    return channel;
  }

}
