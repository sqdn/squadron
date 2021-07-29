import { Formation$Host } from '../impl';
import { Unit, UnitContext } from '../unit';
import { CommChannel } from './comm-channel';
import { CommMethod } from './comm-method';
import { Communicator } from './communicator';

export class Communicator$ implements Communicator {

  private readonly _unit: Unit;
  private readonly _host: Formation$Host;
  private readonly _method: CommMethod;
  private readonly _channels = new Map<string, CommChannel>();

  constructor(context: UnitContext) {
    this._unit = context.unit;
    this._host = context.get(Formation$Host);
    this._method = context.get(CommMethod);
  }

  connect(to: Unit): CommChannel {

    const existing = this._channels.get(to.uid);

    if (existing) {
      return existing;
    }

    const at = this._host.unitFormations(to);

    if (!at.length) {
      throw new TypeError(`${this._unit} can not connect to ${to}. The latter is not deployed`);
    }

    const channel = this._method.connect({
      from: this._unit,
      to,
      at,
    });

    if (!channel) {
      throw new TypeError(`${this._unit} can not connect to ${to}`);
    }

    this._channels.set(to.uid, channel);
    channel.supply.whenOff(() => {
      this._channels.delete(to.uid);
    });

    return channel;
  }

}
