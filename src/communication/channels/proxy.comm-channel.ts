import { digOn_, isOnEvent, OnEvent, trackValue } from '@proc7ts/fun-events';
import { consoleLogger, Logger, logline } from '@proc7ts/logger';
import { asis, noop } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { Unit } from '../../unit';
import { fifoCommBuffer } from '../buffers';
import { CommBuffer } from '../comm-buffer';
import { CommChannel } from '../comm-channel';
import { CommError } from '../comm-error';
import { CommPacket } from '../comm-packet';
import { ClosedCommChannel } from './closed.comm-channel';

/**
 * Proxy communication channel.
 *
 * Proxies commands to another channel. The target channel can dynamically change.
 *
 * Buffers outgoing commands until target channel supplied.
 */
export class ProxyCommChannel implements CommChannel {

  readonly #to: Unit;
  readonly #supply: Supply;
  readonly #closeTarget: (channel: CommChannel, reason?: unknown) => void;
  readonly #targetsSupply: Supply;
  readonly #logger: Logger;
  #target!: ProxyComm$Target;
  readonly #buffer!: ProxyComm$Target;

  /**
   * Constructs proxy communication channel.
   *
   * @param to - Remote unit the channel is opened to.
   * @param supply - Optional channel supply. New one will be created when omitted.
   * @param target - Target channel to proxy commands to. Either a channel instance or its `OnEvent` sender. In the
   * latter case the target channel will change each time new one supplied. When `undefined` supplied or channel closed,
   * the commands are buffered until next channel supplied.
   * @param closeTarget - Whether to close target channel when it is no longer in use. `true` by default.
   * @param buffer - Commands buffer or buffer capacity. The commands added to this buffer while there is no target
   * channel. If nothing or buffer capacity specified, a new {@link fifoCommBuffer FIFO command buffer} created and
   * used.
   * @param logger - Logger to report buffered commands send failures.
   */
  constructor(
      {
        to,
        supply = new Supply(),
        target,
        closeTarget = true,
        buffer,
        logger = consoleLogger,
      }: {
        to: Unit;
        supply?: Supply;
        target: CommChannel | OnEvent<[CommChannel?]>;
        closeTarget?: boolean;
        buffer?: number | CommBuffer;
        logger?: Logger;
      },
  ) {
    this.#to = to;
    this.#supply = supply;
    this.#logger = logger;
    this.#closeTarget = closeTarget
        ? (channel, reason) => channel.supply.off(reason)
        : noop;
    this.#targetsSupply = supply.derive().whenOff(reason => this.#target.endChannels(reason));

    if (isOnEvent(target)) {
      this.#buffer = this.#target = this.#createBuffer(ProxyComm$buffer(buffer));
      target({
        supply: this.#targetsSupply,
        receive: (_, channel) => channel && !channel.supply.isOff
            ? this.#target.channelTo(channel)
            : this.#target.buffer(),
      });
    } else {
      this.#channelTo(target);
      this.#targetsSupply.off();
    }

    supply.whenOff(reason => this.#target.endProxy(reason));
  }

  get to(): Unit {
    return this.#to;
  }

  get supply(): Supply {
    return this.#supply;
  }

  signal<TSignal extends CommPacket>(name: string, signal: TSignal): void {
    this.#target.signal(name, signal);
  }

  request<TRequest extends CommPacket, TResponse = CommPacket>(name: string, request: TRequest): OnEvent<[TResponse]> {
    return this.#target.request(name, request);
  }

  #createBuffer(buffer: CommBuffer<ProxyComm$Command>): ProxyComm$Target {
    buffer.onEvict(command => command.abort('Command buffer overflow')).needs(this);

    const logger = this.#logger;
    const { to } = this;

    this.supply.whenOff(reason => {
      for (; ;) {

        const command = buffer.pull();

        if (!command) {
          break;
        }

        command.abort(reason);
      }
    });

    return {
      signal<TSignal extends CommPacket>(name: string, signal: TSignal): void {
        buffer.addSignal(
            name,
            signal,
            {
              exec(channel) {
                try {
                  channel.signal(name, signal);
                } catch (error) {
                  logger.error(logline`Failed to send signal "${name}" to ${channel.to}`, error);
                }
              },
              abort(reason) {
                logger.warn(logline`Signal "${name}" to ${to} aborted`, reason);
              },
            },
        );
      },
      request<TRequest extends CommPacket, TResponse = CommPacket>(
          name: string,
          request: TRequest,
      ): OnEvent<[TResponse]> {

        const responseTracker = trackValue<OnEvent<[TResponse]>>();
        let exec = (channel: CommChannel): void => {
          try {
            responseTracker.it = channel.request(name, request);
          } catch (error) {
            responseTracker.supply.off(
                new CommError(to, `Failed to send request "${name}" to ${channel.to}`, error),
            );
          }
        };

        responseTracker.supply.whenOff(() => exec = noop);

        buffer.addRequest(
            name,
            request,
            {
              exec: channel => exec(channel),
              abort: reason => responseTracker.supply.off(
                  new CommError(to, `Request "${name}" to ${to} aborted`, reason),
              ),
            },
        );

        return responseTracker.read.do(
            digOn_(asis),
        );
      },
      channelTo: (channel: CommChannel) => {
        this.#channelTo(channel);

        for (; ;) {
          if (channel.supply.isOff) {
            break;
          }

          const command = buffer.pull();

          if (!command) {
            break;
          }

          command.exec(channel);
        }
      },
      buffer: noop,
      endChannels: reason => {
        // No channels will be received, and no current channel.
        // Close proxy.
        this.#channelTo(new ClosedCommChannel(this.#to, reason));
        this.supply.off(reason);
      },
      endProxy: noop,
    };
  }

  #channelTo(channel: CommChannel): void {

    const target = this.#target = {
      signal<TSignal extends CommPacket>(name: string, signal: TSignal): void {
        channel.signal(name, signal);
      },
      request<TRequest extends CommPacket, TResponse = CommPacket>(
          name: string,
          request: TRequest,
      ): OnEvent<[TResponse]> {
        return channel.request(name, request);
      },
      channelTo: nextChannel => {
        this.#channelTo(nextChannel);
        this.#closeTarget(channel);
      },
      buffer: () => {
        this.#target = this.#buffer;
        this.#closeTarget(channel);
      },
      endChannels: noop,
      endProxy: reason => {
        this.#closeTarget(channel, reason);
      },
    };

    channel.supply.whenOff(_ => {
      if (this.#target === target && !this.#targetsSupply.isOff) {
        // Current channel disabled, but another one could be provided later.
        // Buffer commands until then.
        this.#target = this.#buffer;
      }
    });
  }

}

function ProxyComm$buffer(buffer?: CommBuffer | number): CommBuffer<ProxyComm$Command> {
  return buffer && typeof buffer !== 'number'
      ? buffer as CommBuffer<ProxyComm$Command>
      : fifoCommBuffer(buffer);
}

interface ProxyComm$Target {

  signal<TSignal extends CommPacket>(name: string, signal: TSignal): void;

  request<TRequest extends CommPacket, TResponse = CommPacket>(name: string, request: TRequest): OnEvent<[TResponse]>;

  channelTo(nextChannel: CommChannel): void;

  buffer(): void;

  endChannels(reason: unknown): void;

  endProxy(reason: unknown): void;

}

interface ProxyComm$Command {

  exec(channel: CommChannel): void;

  abort(reason: unknown): void;

}
