import { CxAsset, CxEntry } from '@proc7ts/context-values';
import { afterThe, digOn_, onceOn, OnEvent, valueOn_ } from '@proc7ts/fun-events';
import { Logger } from '@proc7ts/logger';
import {
  CommHandler,
  CommPacket,
  commProcessorBy,
  CommProtocol,
  CommResponder,
  MessageCommChannel,
} from '../../communication';
import { Formation, FormationContext } from '../../formation';
import { OrderUnits, Unit, UnitStatus } from '../../unit';
import { UseMessagePortCommRequest } from './use-message-port.comm-request';

export class UseMessagePortCommResponder implements CommResponder<UseMessagePortCommRequest> {

  static get entry(): CxEntry<CommProtocol, CommHandler> {
    return CommProtocol;
  }

  static buildAsset(
      target: CxEntry.Target<CommProtocol, CommHandler>,
  ): (collector: CxAsset.Collector<CommHandler>) => void {

    const responder = new UseMessagePortCommResponder(target);

    return collector => collector(responder);
  }

  readonly #fmnContext: FormationContext;
  readonly #orderUnits: OrderUnits;

  private constructor(target: CxEntry.Target<CommProtocol, CommHandler>) {
    this.#fmnContext = target.get(FormationContext);
    this.#orderUnits = this.#fmnContext.formation.order.get(OrderUnits);
  }

  get name(): string {
    return UseMessagePortCommRequest;
  }

  respond(request: UseMessagePortCommRequest): OnEvent<[CommPacket]> {
    return afterThe(request).do(
        digOn_(({ fromFormation, toUnit, port }) => {

          const from = this.#orderUnits.unitByUid(fromFormation, Formation);
          const to = this.#orderUnits.unitByUid(toUnit, Unit);
          const context = this.#fmnContext.contextOf(to);
          const processor = commProcessorBy(context.get(CommProtocol).channelProcessor(from));

          new MessageCommChannel({
            to: from,
            port,
            processor,
            logger: context.get(Logger),
          });

          return context.readStatus.do(
              valueOn_(status => status >= UnitStatus.Ready && {}),
              onceOn,
          );
        }),
    );
  }

}
