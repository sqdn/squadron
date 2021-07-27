import { Formation$Host } from '../impl';
import { Unit, UnitContext } from '../unit';
import { CommChannel } from './comm-channel';
import { Communicator } from './communicator';

export class Communicator$ implements Communicator {

  private readonly _host: Formation$Host;
  private readonly _channels = new Map<string, CommChannel>();

  constructor(context: UnitContext) {
    this._host = context.get(Formation$Host);
  }

  connect(to: Unit): CommChannel {

    const existing = this._channels.get(to.uid);

    if (existing) {
      return existing;
    }

    const formations = this._host.unitFormations(to);

    if (!formations.length) {
      throw new TypeError(`Can not connect to ${to}. It is not deployed`);
    }

    // TODO Establish communication channel

    return undefined!;
  }

}
