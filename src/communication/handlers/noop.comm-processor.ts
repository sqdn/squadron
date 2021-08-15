import { CommPacket } from '../comm-packet';
import { CommProcessor } from '../comm-processor';

/**
 * Communication processor that never processes inbound commands.
 */
export class NoopCommProcessor implements CommProcessor {

  static receive(_name: string, _signal: CommPacket): false {
    return false;
  }

  static respond(_name: string, _request: CommPacket): undefined {
    return;
  }

  receive(_name: string, _signal: CommPacket): false {
    return false;
  }

  respond(_name: string, _request: CommPacket): undefined {
    return;
  }

}
