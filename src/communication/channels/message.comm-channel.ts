import { EventEmitter, OnEvent, onEventBy } from '@proc7ts/fun-events';
import { consoleLogger, Logger } from '@proc7ts/logger';
import { Supply } from '@proc7ts/supply';
import { v4 as UUIDv4 } from 'uuid';
import { MessagePort, TransferListItem } from 'worker_threads';
import { Unit } from '../../unit';
import { CommChannel } from '../comm-channel';
import { CommPacket } from '../comm-packet';
import { CommProcessor } from '../comm-processor';
import { createCommProcessor } from '../handlers';

const enum MessageComm$Type {
  Signal,
  Request,
  Response,
  EndRequest,
}

/**
 * Messaging communication channel.
 *
 * Utilizes `MessagePort` to send and receive messages.
 */
export class MessageCommChannel implements CommChannel {

  readonly #to: Unit;
  readonly #supply: Supply;
  readonly #port: MessagePort;
  readonly #processor: CommProcessor;
  readonly #logger: Logger;
  readonly #streams = new Map<string, EventEmitter<[CommPacket]>>();

  /**
   * Constructs messaging communication channel.
   *
   * @param to - Remote unit the `port` sends messages to.
   * @param port - Message port to send outgoing messages to and receive inbound ones from.
   * @param processor - Inbound commands processor. Processes nothing by default.
   * @param logger - Logger to report communication issues to.
   */
  constructor(
      {
        to,
        port,
        processor = createCommProcessor(),
        logger = consoleLogger,
      }: {
        to: Unit;
        port: MessagePort;
        processor?: CommProcessor;
        logger?: Logger;
      },
  ) {
    this.#to = to;
    this.#supply = new Supply(() => {
      port.close();
    });
    port.once('close', () => {
      this.supply.off();
    });
    this.#port = port;
    this.#processor = processor;
    this.#logger = logger;
    port.on('message', (wrapper: MessageComm$Wrapper) => this.#onCommand(wrapper));
  }

  get to(): Unit {
    return this.#to;
  }

  get supply(): Supply {
    return this.#supply;
  }

  signal<TSignal extends CommPacket>(name: string, signal: TSignal): void {

    const [body, transferList] = MessageComm$extractTransferList(signal);
    const wrapper: MessageComm$Wrapper = {
      sqdn: {
        type: MessageComm$Type.Signal,
        name,
        body,
      },
    };

    this.#port.postMessage(wrapper, transferList);
  }

  request<TRequest extends CommPacket, TResponse = CommPacket>(
      name: string,
      request: TRequest,
  ): OnEvent<[TResponse]> {
    return onEventBy(receiver => {

      const streamId = `${name}#${UUIDv4()}`;
      const [message, transferList] = MessageComm$extractTransferList(request);
      const { meta = {} } = message;

      const body = {
        ...message,
        meta: { ...meta, streamId: streamId },
      };
      const wrapper: MessageComm$Wrapper = {
        sqdn: {
          type: MessageComm$Type.Request,
          name,
          body,
        },
      };

      const stream = this.#openStream(streamId);

      this.#streams.set(streamId, stream);
      receiver.supply.whenOff(reason => this.#closeStream(name, streamId, reason));
      stream.on(receiver);

      this.#port.postMessage(wrapper, transferList);
    });
  }

  #openStream(streamId: string): EventEmitter<[CommPacket]> {

    const stream = new EventEmitter<[CommPacket]>();

    this.#streams.set(streamId, stream);
    stream.supply
        .needs(this)
        .whenOff(() => this.#streams.delete(streamId));

    return stream;
  }

  #closeStream(name: string, streamId: string, reason: unknown): void {

    const stream = this.#streams.get(streamId);

    if (!stream) {
      return;
    }

    this.#streams.delete(streamId);
    stream.supply.off(reason);

    const endRequestWrapper: MessageComm$Wrapper = {
      sqdn: {
        type: MessageComm$Type.EndRequest,
        name,
        body: { meta: { streamId, reason } },
      },
    };

    this.#port.postMessage(endRequestWrapper);
  }

  #onCommand(wrapper: MessageComm$Wrapper): void {

    const { sqdn } = wrapper;

    if (sqdn) {

      const { type, name, body } = sqdn;

      if (typeof body === 'object' && body) {
        switch (type) {
        case MessageComm$Type.Signal:
          return this.#processor.receive(name, body, this);
        case MessageComm$Type.Request:
          return this.#onRequest(name, body);
        case MessageComm$Type.Response:
          return this.#onResponse(body);
        case MessageComm$Type.EndRequest:
          return this.#onEndRequest(body);
        }
      }
    }

    this.#logger.error('Unrecognized message received', wrapper);
  }

  #onRequest(name: string, request: CommPacket): void {

    const streamId = request.meta?.streamId;

    if (!streamId) {
      this.#logger.error('Unrecognized request received', request);
      return;
    }

    const stream = this.#openStream(streamId);
    const onResponse = this.#processor.respond(name, request, this);

    onResponse({
      supply: stream.supply.derive().whenOff(reason => this.#closeStream(name, streamId, reason)),
      receive: (_, response) => {

        const [body, transferList] = MessageComm$extractTransferList(response);
        const responseWrapper: MessageComm$Wrapper = {
          sqdn: {
            type: MessageComm$Type.Response,
            name,
            body: {
              ...body,
              meta: {
                ...body.meta,
                streamId,
              },
            },
          },
        };

        this.#port.postMessage(responseWrapper, transferList);
      },
    });
  }

  #onResponse(response: CommPacket): void {

    const { meta: { streamId = '' } = {} } = response;
    const stream = this.#streams.get(streamId);

    if (stream) {
      stream.send(response);
    } else {
      this.#logger.error('Unexpected response received', response);
    }
  }

  #onEndRequest(response: CommPacket): void {

    const { meta: { streamId, reason } = {} } = response;
    const stream = this.#streams.get(streamId!);

    if (stream) {
      stream.supply.off(reason);
    }
  }

}

interface MessageComm$Wrapper {
  sqdn?: {
    type: MessageComm$Type;
    name: string;
    body?: CommPacket;
  };
}

function MessageComm$extractTransferList(packet: CommPacket): [CommPacket, (readonly TransferListItem[] | undefined)?] {

  const { meta } = packet;

  if (meta && meta.transferList) {

    const { transferList, ...rest } = meta;

    return [{ ...packet, meta: rest }, transferList];
  }

  return [packet];
}
