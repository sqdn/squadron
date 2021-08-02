import { OnEvent } from '@proc7ts/fun-events';
import { CommChannel } from '../comm-channel';
import { CommPacket } from '../comm-packet';
import { CommProcessor } from '../comm-processor';

/**
 * Creates inbound communication processor that proxies commands to another one.
 *
 * @param getProcessor - Returns communication processor to proxy inbound commands to. The target processor accessed
 * on each request.
 *
 * @returns Proxying communication processor.
 */
export function proxyCommProcessor(getProcessor: (this: void) => CommProcessor): CommProcessor {
  return {
    receive(name: string, signal: CommPacket, channel: CommChannel): void {
      getProcessor().receive(name, signal, channel);
    },
    respond(name: string, request: CommPacket, channel: CommChannel): OnEvent<[CommPacket]> {
      return getProcessor().respond(name, request, channel);
    },
  };
}
