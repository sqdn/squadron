import { mapOn_, OnEvent } from '@proc7ts/fun-events';
import { Logger } from '@proc7ts/logger';
import { UnitLocator } from '../formation';
import { Formation$Host } from '../impl';
import { Unit, UnitContext } from '../unit';
import { DirectCommChannel, ProxyCommChannel } from './channels';
import { CommChannel } from './comm-channel';
import { commProcessorBy } from './comm-processor';
import { CommProtocol } from './comm-protocol';
import { Communicator } from './communicator';
import { CommLinker } from './linkage';

export class Communicator$ implements Communicator {

  readonly #unit: Unit;
  readonly #locator: UnitLocator;
  readonly #host: Formation$Host;
  readonly #linker: CommLinker;
  readonly #logger: Logger;
  readonly #channels = new Map<string, CommChannel>();

  constructor(context: UnitContext) {
    this.#unit = context.unit;
    this.#locator = context.get(UnitLocator);
    this.#host = context.get(Formation$Host);
    this.#linker = context.get(CommLinker);
    this.#logger = context.get(Logger);
  }

  connect(to: Unit): CommChannel {

    const existing = this.#channels.get(to.uid);

    if (existing) {
      return existing;
    }

    const onLocation = this.#locator.locateUnit(to);
    const target: OnEvent<[CommChannel?]> = onLocation.do(
        mapOn_(location => {
          if (location.isLocal) {
            return new DirectCommChannel({
              to,
              processor: commProcessorBy(
                  this.#host.deploymentOf(to).context.get(CommProtocol).channelProcessor(this.#unit),
              ),
            });
          }

          const { formations } = location;

          if (!formations.length) {
            return;
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
