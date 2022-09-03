import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry } from '@proc7ts/context-values';
import { mapOn_, OnEvent } from '@proc7ts/fun-events';
import { Logger } from '@proc7ts/logger';
import { MessageChannel } from 'node:worker_threads';
import {
  CommChannel,
  CommLink,
  CommLinker,
  commProcessorBy,
  CommProtocol,
  MessageCommChannel,
  ProxyCommChannel,
} from '../../communication';
import { Formation, FormationContext } from '../../formation';
import { Unit } from '../../unit';
import { Formation$Host } from '../formation.host';
import {
  LinkMessagePortCommRequest,
  LinkMessagePortCommResponse,
  UseMessagePortCommRequest,
  UseMessagePortCommResponder,
} from '../packets';
import { Formation$CtlChannel } from './formation.ctl-channel';

/**
 * Communication linker implementation to be used by {@link Formation formation}.
 *
 * This class can be used as a formation context asset that provides both link implementation and {@link CommResponder
 * inbound command responder} for {@link UseMessagePortCommRequest} request.
 */
export class Formation$CommLinker implements CommLinker {

  static get entry(): CxEntry<CommLinker> {
    return CommLinker;
  }

  static setupAsset(target: CxEntry.Target<CommLinker>): void {
    const linker = new Formation$CommLinker(target);

    target.provide(cxConstAsset(CommLinker, linker));
    target.provide(UseMessagePortCommResponder);
  }

  readonly #context: FormationContext;
  readonly #links = new Map<string, CommLink>();
  readonly #ctlChannel: Formation$CtlChannel;

  private constructor(target: CxEntry.Target<CommLinker>) {
    this.#context = target.get(FormationContext);
    this.#ctlChannel = target.get(Formation$CtlChannel);
  }

  link(formation: Formation): CommLink {
    let link = this.#links.get(formation.uid);

    if (!link) {
      const host = this.#context.get(Formation$Host);
      const logger = this.#context.get(Logger);

      if (formation.uid === this.#context.hub.uid) {
        // Hub link. Reuse control channel.
        link = new Formation$CommLink(host, formation, this.#ctlChannel);
      } else {
        // Other formation. Request new link.

        const onResponse = this.#ctlChannel.request<
          LinkMessagePortCommRequest,
          LinkMessagePortCommResponse
        >(LinkMessagePortCommRequest, {
          fromFormation: this.#context.formation.uid,
          toFormation: formation.uid,
        });
        const processor = commProcessorBy(
          this.#context.get(CommProtocol).channelProcessor(formation),
        );
        const target: OnEvent<[CommChannel]> = onResponse.do(
          mapOn_(
            ({ port }) => new MessageCommChannel({
                to: formation,
                port,
                processor,
                logger,
              }),
          ),
        );

        link = new Formation$CommLink(
          host,
          formation,
          new ProxyCommChannel({
            to: formation,
            target,
            logger,
          }),
        );
      }

      this.#links.set(formation.uid, link);
    }

    return link;
  }

}

class Formation$CommLink implements CommLink {

  readonly #host: Formation$Host;
  readonly #to: Formation;
  readonly #channel: CommChannel;

  constructor(host: Formation$Host, to: Formation, channel: CommChannel) {
    this.#host = host;
    this.#to = to;
    this.#channel = channel;
  }

  get to(): Formation {
    return this.#to;
  }

  connect(to: Unit): CommChannel {
    const { context } = this.#host;
    const logger = context.get(Logger);
    const { port1, port2 } = new MessageChannel();
    const onPortAccepted = this.#channel.request<UseMessagePortCommRequest>(
      UseMessagePortCommRequest,
      {
        meta: { transferList: [port2] },
        fromFormation: context.formation.uid,
        toUnit: to.uid,
        port: port2,
      },
    );
    const processor = commProcessorBy(context.get(CommProtocol).channelProcessor(to));
    const target: OnEvent<[CommChannel]> = onPortAccepted.do(
      mapOn_(
        () => new MessageCommChannel({
            to,
            port: port1,
            processor,
            logger,
          }),
      ),
    );

    return new ProxyCommChannel({
      to: to,
      target,
      logger,
    });
  }

}
