import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry } from '@proc7ts/context-values';
import { afterThe, mapOn_, OnEvent } from '@proc7ts/fun-events';
import { Logger } from '@proc7ts/logger';
import { MessageChannel } from 'worker_threads';
import {
  CommChannel,
  CommLink,
  CommLinker,
  CommPacket,
  CommProcessor,
  MessageCommChannel,
  ProxyCommChannel,
} from '../../communication';
import { Formation, FormationContext } from '../../formation';
import { Hub } from '../../hub';
import { Unit } from '../../unit';
import { Formation$Host } from '../formation.host';
import { Formation$LaunchData } from '../formation.launch-data';
import { CommMessagingRequest } from './comm-messaging-request';

/**
 * Communication linker implementation to be used by {@link Formation formation}.
 *
 * This class can be used as a formation context asset that provides both link implementation and {@link CommResponder
 * inbound command responder} for {@link CommMessagingRequest} request.
 */
export class FormationCommLinker implements CommLinker {

  static get entry(): CxEntry<CommLinker> {
    return CommLinker;
  }

  static setupAsset(target: CxEntry.Target<CommLinker>): void {

    const linker = new FormationCommLinker(target);

    target.provide(cxConstAsset(CommLinker, linker));
    target.provide(cxConstAsset(
        CommProcessor,
        {
          name: 'message-comm-port',
          respond: (request: CommMessagingRequest) => linker.#acceptPort(request),
        },
    ));
  }

  readonly #context: FormationContext;
  readonly #links = new Map<string, CommLink>();
  readonly #hubChannel: CommChannel;

  private constructor(target: CxEntry.Target<CommLinker>) {
    this.#context = target.get(FormationContext);

    const launchData = target.get(Formation$LaunchData);

    this.#hubChannel = new MessageCommChannel({
      to: new Hub({ id: launchData.hubUid }),
      port: launchData.hubPort,
      logger: target.get(Logger),
    });
  }

  link(formation: Formation): CommLink {

    let link = this.#links.get(formation.uid);

    if (!link) {

      const host = this.#context.get(Formation$Host);
      const logger = this.#context.get(Logger);
      const { port1, port2 } = new MessageChannel();
      const onPortAccepted = this.#hubChannel.request<CommMessagingRequest>(
          'message-comm-port',
          {
            meta: { transferList: [port2] },
            fromFormation: this.#context.formation.uid,
            toUnit: formation.uid,
            port: port2,
          },
      );
      const target: OnEvent<[CommChannel]> = onPortAccepted.do(
          mapOn_(() => new MessageCommChannel({
            to: formation,
            port: port1,
            processor: this.#context.get(CommProcessor),
            logger,
          })),
      );

      link = new FormationToFormationCommLink(
          host,
          formation,
          new ProxyCommChannel({
            to: formation,
            target,
            logger,
          }),
      );

      this.#links.set(formation.uid, link);
    }

    return link;
  }

  #acceptPort(request: CommMessagingRequest): OnEvent<[CommPacket]> {
    return afterThe(request).do(
        mapOn_(({ fromFormation, port }) => {

          // Process inbound commands.
          new MessageCommChannel({
            to: new Formation({ id: fromFormation }),
            port,
            processor: this.#context.get(CommProcessor),
            logger: this.#context.get(Logger),
          });

          return {};
        }),
    );
  }

}

class FormationToFormationCommLink implements CommLink {

  readonly #host: Formation$Host;
  readonly #to: Formation;
  readonly #channel: CommChannel;

  constructor(
      host: Formation$Host,
      to: Formation,
      channel: CommChannel,
  ) {
    this.#host = host;
    this.#to = to;
    this.#channel = channel;
  }

  get to(): Formation {
    return this.#to;
  }

  connect(unit: Unit): CommChannel {

    const deployment = this.#host.unitDeployment(unit);
    const context = deployment.context();
    const logger = context.get(Logger);
    const { port1, port2 } = new MessageChannel();
    const onPortAccepted = this.#channel.request<CommMessagingRequest>(
        'message-comm-port',
        {
          meta: { transferList: [port2] },
          fromFormation: this.#host.formation.uid,
          toUnit: unit.uid,
          port: port2,
        },
    );
    const target: OnEvent<[CommChannel]> = onPortAccepted.do(
        mapOn_(() => new MessageCommChannel({
          to: unit,
          port: port1,
          processor: context.get(CommProcessor),
          logger,
        })),
    );

    return new ProxyCommChannel({
      to: unit,
      target,
      logger,
    });
  }

}
