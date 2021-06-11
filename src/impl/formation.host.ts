import { ContextKey, ContextKey__symbol, ContextRegistry, SingleContextKey } from '@proc7ts/context-values';
import Order from '@sqdn/order';
import { UnitLogger } from '../common';
import { Formation, FormationContext } from '../formation';
import { newFormationContext } from '../formation/formation-context.impl';
import { Unit, UnitContext, UnitTask } from '../unit';
import { Unit$Deployment } from '../unit/unit.deployment.impl';
import { Unit$Host } from '../unit/unit.host.impl';
import { Formation$Workbench } from './formation.workbench';

const Formation$Host__key = (/*#__PURE__*/ new SingleContextKey<Formation$Host>('FormationHost'));

export class Formation$Host implements Unit$Host {

  static get [ContextKey__symbol](): ContextKey<Formation$Host> {
    return Formation$Host__key;
  }

  readonly workbench = new Formation$Workbench();
  readonly registry: ContextRegistry<FormationContext>;
  readonly context: FormationContext;
  readonly perOrderRegistry: ContextRegistry<Order>;
  readonly perUnitRegistry: ContextRegistry<UnitContext>;

  private readonly _deployments = new Map<string, Unit$Deployment<any>>();

  constructor(readonly formation: Formation) {
    this.registry = new ContextRegistry();
    this.registry.provide({ a: Formation$Host, is: this });
    this.context = newFormationContext(this);

    this.perOrderRegistry = new ContextRegistry(this.context);
    this.perUnitRegistry = new ContextRegistry(this.context);
  }

  get log(): UnitLogger {
    return this.context.get(UnitLogger);
  }

  async executeUnitTask<TUnit extends Unit>(unit: TUnit, task: UnitTask<TUnit>): Promise<void> {
    await task(this.unitDeployment(unit).context());
  }

  unitDeployment<TUnit extends Unit>(unit: TUnit): Unit$Deployment<TUnit> {

    let deployment = this._deployments.get(unit.uid);

    if (!deployment) {
      deployment = new Unit$Deployment(this, unit);
      this._deployments.set(unit.uid, deployment);
    }

    return deployment;
  }

  newOrder(orderId: string): {
    registry: ContextRegistry<Order>;
    order: Order;
  } {

    const registry = new ContextRegistry<Order>(this.perOrderRegistry.seeds());
    const order: Order = {
      [ContextKey__symbol]: Order[ContextKey__symbol],
      orderId,
      get: registry.newValues().get,
    };

    registry.provide({ a: Order, is: order });

    return { registry, order };
  }

}
