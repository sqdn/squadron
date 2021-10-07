import { CxAsset, CxEntry, CxRequest } from '@proc7ts/context-values';
import { logline } from '@proc7ts/logger';
import { Supply } from '@proc7ts/supply';
import Order from '@sqdn/order';
import { Formation, FormationContext } from '../formation';
import { Hub } from '../hub';
import { Formation$Host } from '../impl';
import { OrderSubject, OrderTask } from '../order';
import { Unit } from './unit';
import { UnitContext } from './unit-context';
import { UnitStatus } from './unit-status';
import { Unit$Deployment } from './unit.deployment.impl';

export class Unit$OrderSubject<TUnit extends Unit> implements OrderSubject<TUnit> {

  readonly #deployment: Unit$Deployment<TUnit>;
  readonly #supply: Supply;
  #run = this.#actuallyRun;
  #deploymentsCount = 0;

  constructor(backend: Unit$Deployment<TUnit>, supply: Supply) {
    this.#deployment = backend;
    this.#supply = supply.whenOff(reason => this.#run = this.#rejectDeployment(reason));
  }

  get hub(): Hub {
    return this.context.hub;
  }

  get formation(): Formation {
    return this.context.formation;
  }

  get unit(): TUnit {
    return this.context.unit;
  }

  get context(): UnitContext<TUnit> {
    return this.#deployment.context;
  }

  get supply(): Supply {
    return this.#supply;
  }

  get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest.WithoutFallback<TValue>): TValue;
  get<TValue>(entry: CxEntry<TValue, unknown>, request: CxRequest.WithFallback<TValue>): TValue;
  get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest<TValue>): TValue | null;

  get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest<TValue>): TValue | null {
    return this.context.get(entry, request);
  }

  get #host(): Formation$Host {
    return this.#deployment.host;
  }

  provide<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, UnitContext<TUnit>>): Supply {
    return this.#deployment.builder.provide(asset).needs(this);
  }

  perFormation<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, FormationContext>): Supply {
    return this.#host.formationBuilder.provide(asset).needs(this);
  }

  perOrder<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, Order>): Supply {
    return this.#host.perOrderCxPeer.provide(asset).needs(this);
  }

  perUnit<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, UnitContext>): Supply {
    return this.#host.perUnitCxPeer.provide(asset).needs(this);
  }

  run(task: OrderTask<TUnit>): void {
    this.#run(task);
  }

  #actuallyRun(task: OrderTask<TUnit>): void {
    ++this.#deploymentsCount;

    const host = this.#host;

    host.workbench.deploy(async () => {
      try {
        await task(host.unitDeployment(this.unit).context);
        if (!--this.#deploymentsCount) {
          this.#deployment.setStatus(UnitStatus.Executed);
        }
      } catch (error) {
        host.log.error(logline`Failed to deploy ${this.unit}`, error);
        this.supply.off(error);
      }
    });
  }

  #rejectDeployment(error: unknown): () => void {
    return () => this.#host.log.warn(logline`Deployment of ${this.unit} rejected`, error);
  }

}
