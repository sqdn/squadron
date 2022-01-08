import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry } from '@proc7ts/context-values';
import { afterThe, digOn_, mapOn_, OnEvent } from '@proc7ts/fun-events';
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
import { FormationCtl, FormationManager } from '../../hub';
import { OrderUnits, Unit } from '../../unit';
import {
  LinkMessagePortCommRequest,
  LinkMessagePortCommResponse,
  UseMessagePortCommRequest,
  UseMessagePortCommResponder,
} from '../packets';

/**
 * Communication linker implementation to be used by {@link Hub central hub}.
 *
 * This class can be used as a formation context asset that provides both link implementation and {@link CommResponder
 * inbound command responder} for {@link LinkMessagePortCommRequest} request.
 */
export class Hub$CommLinker implements CommLinker {

  static get entry(): CxEntry<CommLinker> {
    return CommLinker;
  }

  static setupAsset(target: CxEntry.Target<CommLinker>): void {

    const linker = new Hub$CommLinker(target);

    target.provide(cxConstAsset(CommLinker, linker));
    target.provide(UseMessagePortCommResponder);
    target.provide(cxConstAsset(
        CommProtocol,
        {
          name: LinkMessagePortCommRequest,
          respond: (request: LinkMessagePortCommRequest) => linker.#link(request),
        },
    ));
  }

  readonly #context: FormationContext;
  readonly #orderUnits: OrderUnits;
  readonly #formationManager: FormationManager;
  readonly #links = new Map<string, CommLink>();

  private constructor(target: CxEntry.Target<CommLinker>) {
    this.#context = target.get(FormationContext);
    this.#orderUnits = this.#context.formation.createdIn.get(OrderUnits);
    this.#formationManager = target.get(FormationManager);
  }

  link(formation: Formation): CommLink {

    let link = this.#links.get(formation.uid);

    if (!link) {
      link = new Hub$CommLink(
          this.#context,
          this.#formationManager.formationCtl(formation),
      );
      this.#links.set(formation.uid, link);
    }

    return link;
  }

  #link(request: LinkMessagePortCommRequest): OnEvent<[LinkMessagePortCommResponse]> {
    return afterThe(request)
        .do(
            digOn_(({ toFormation }) => {

              const ctl = this.#formationManager.formationCtl(this.#orderUnits.unitByUid(toFormation, Formation));
              const { port1, port2 } = new MessageChannel();

              return ctl.channel.request<UseMessagePortCommRequest>(
                  UseMessagePortCommRequest,
                  {
                    meta: { transferList: [port2] },
                    fromFormation: request.fromFormation,
                    toUnit: request.toFormation,
                    port: port2,
                  },
              ).do(mapOn_(() => ({
                meta: { transferList: [port1] },
                port: port1,
              })));
            }),
        );
  }

}

class Hub$CommLink implements CommLink {

  readonly #context: FormationContext;
  readonly #ctl: FormationCtl;

  constructor(context: FormationContext, ctl: FormationCtl) {
    this.#context = context;
    this.#ctl = ctl;
  }

  get to(): Formation {
    return this.#ctl.formation;
  }

  connect(to: Unit): CommChannel {

    const logger = this.#context.get(Logger);
    const { port1, port2 } = new MessageChannel();
    const onPortAccepted = this.#ctl.channel.request<UseMessagePortCommRequest>(
        UseMessagePortCommRequest,
        {
          meta: { transferList: [port2] },
          fromFormation: this.#context.formation.uid,
          toUnit: to.uid,
          port: port2,
        },
    );

    return new ProxyCommChannel({
      to,
      target: onPortAccepted.do(
          mapOn_(() => new MessageCommChannel({
            to,
            port: port1,
            processor: commProcessorBy(this.#context.get(CommProtocol).channelProcessor(to)),
            logger,
          })),
      ),
      logger,
    });
  }

}
