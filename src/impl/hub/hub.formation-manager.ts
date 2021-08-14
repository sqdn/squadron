import { CxAsset, CxEntry } from '@proc7ts/context-values';
import { trackValue } from '@proc7ts/fun-events';
import { Logger } from '@proc7ts/logger';
import { lazyValue } from '@proc7ts/primitives';
import { CommChannel, CommProcessor, ProxyCommChannel, proxyCommProcessor } from '../../communication';
import { Formation, FormationContext } from '../../formation';
import { FormationCtl, FormationManager, FormationStarter } from '../../hub';

export class Hub$FormationManager implements FormationManager {

  static get entry(): CxEntry<FormationManager> {
    return FormationManager;
  }

  static buildAsset(
      target: CxEntry.Target<FormationManager>,
  ): (collector: CxAsset.Collector<FormationManager>) => void {

    const manager = new Hub$FormationManager(target);

    return collector => collector(manager);
  }

  readonly #context: FormationContext;
  readonly #ctls = new Map<string, Hub$FormationCtl>();

  private constructor(target: CxEntry.Target<FormationManager>) {
    this.#context = target.get(FormationContext);
  }

  formationCtl(formation: Formation): FormationCtl {

    let ctl = this.#ctls.get(formation.uid);

    if (!ctl) {
      ctl = new Hub$FormationCtl(formation, this.#context);
      this.#ctls.set(formation.uid, ctl);
    }

    return ctl;
  }

}

class Hub$FormationCtl implements FormationCtl {

  readonly #formation: Formation;
  readonly #context: FormationContext;
  #channel?: CommChannel;

  constructor(formation: Formation, context: FormationContext) {
    this.#formation = formation;
    this.#context = context;
  }

  get formation(): Formation {
    return this.#formation;
  }

  get channel(): CommChannel {
    if (!this.#channel) {

      const starter = this.#context.get(FormationStarter);
      const target = trackValue<CommChannel>();
      const processor = proxyCommProcessor(lazyValue(() => this.#context.get(CommProcessor)));

      this.#channel = new ProxyCommChannel({
        to: this.formation,
        target: target.on,
        logger: this.#context.get(Logger),
      });

      target.it = starter.startFormation(this.formation, { processor });
    }

    return this.#channel;
  }

}
