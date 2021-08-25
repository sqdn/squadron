import { CxBuilder, cxConstAsset, CxPeerBuilder } from '@proc7ts/context-builder';
import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { Logger } from '@proc7ts/logger';
import Order from '@sqdn/order';
import { Formation, FormationContext } from '../formation';
import { Hub } from '../hub';
import { OrderTask } from '../order';
import { Unit, UnitContext, UnitOrigin } from '../unit';
import { Unit$Deployment } from '../unit/unit.deployment.impl';
import { Unit$Host } from '../unit/unit.host.impl';
import { Formation$Factory } from './formation.factory';
import { Formation$Order } from './formation.order';
import { Order$Workbench } from './order.workbench';
import { Unit$DeploymentTracker } from './unit.deployment-tracker';

const Formation$Host$perContext: CxEntry.Definer<Formation$Host> = (/*#__PURE__*/ cxSingle());

export class Formation$Host implements Unit$Host {

  static perContext(target: CxEntry.Target<Formation$Host>): CxEntry.Definition<Formation$Host> {
    return Formation$Host$perContext(target);
  }

  static toString(): string {
    return '[Formation:Host]';
  }

  readonly workbench = new Order$Workbench();
  readonly formationBuilder: CxBuilder<FormationContext>;
  readonly context: FormationContext;
  readonly perOrderCxPeer: CxPeerBuilder<Order>;
  readonly perUnitCxPeer: CxPeerBuilder<UnitContext>;

  readonly #factory: Formation$Factory;
  #order?: Order;
  #orderBuilder?: CxBuilder<Order>;
  #_origin?: UnitOrigin;
  readonly #units = new Map<string, Unit>();
  readonly #deployments = new Map<string, Unit$Deployment<any>>();
  readonly #deploymentTrackers = new Map<string, Unit$DeploymentTracker>();
  #formationDeployed: 0 | 1 = 0;

  constructor(factory: Formation$Factory) {
    this.#factory = factory;
    this.formationBuilder = new CxBuilder(
        (get, builder) => factory.createContext(this, get, builder),
    );
    this.context = this.formationBuilder.context;

    this.perOrderCxPeer = new CxPeerBuilder<Order>(this.formationBuilder.boundPeer);
    this.perUnitCxPeer = new CxPeerBuilder<UnitContext>(this.formationBuilder.boundPeer);
  }

  get hub(): Hub {
    return this.#origin.hub;
  }

  get formation(): Formation {
    return this.#origin.formation;
  }

  get #origin(): UnitOrigin {
    return this.#_origin ||= this.#factory.createOrigin(this.order, this.orderBuilder);
  }

  get order(): Order {
    return this.#order ||= this.orderBuilder.context;
  }

  get orderBuilder(): CxBuilder<Order> {
    return this.#orderBuilder ||= this.#newOrderBuilder();
  }

  #newOrderBuilder(): CxBuilder<Order> {
    return new CxBuilder<Order>(
        (get, builder) => {

          const { createOrder } = this.#factory;
          const order = createOrder
              ? createOrder(get, builder)
              : new Formation$Order(this.#factory.orderId, get);

          builder.provide(cxConstAsset(Order.entry, order));

          return order;
        },
        this.perOrderCxPeer,
    );
  }

  get log(): Logger {
    return this.context.get(Logger);
  }

  addUnit(unit: Unit): void {
    if (!this.#units.has(unit.uid)) {
      this.putUnit(unit);
    }
  }

  putUnit(unit: Unit): void {
    this.#units.set(unit.uid, unit);
  }

  unitByUid<TUnit extends Unit>(order: Order, id: string, unitType: new (init?: Unit.Init) => TUnit): TUnit {

    const unit = this.#units.get(id);

    if (unit) {
      if (unit instanceof unitType) {
        return unit;
      }
      if (unit.hasInstructions || !(unitType.prototype instanceof unit.constructor)) {
        throw new TypeError(`${unit} is not a ${unitType.name}`);
      }
    }

    const newUnit = new unitType({ id, order: order });

    this.#units.set(id, newUnit);

    return newUnit;
  }

  deploy(formation: Formation, unit: Unit): void {
    this.trackDeployments(unit).deployTo(formation);
  }

  trackDeployments<TUnit extends Unit>(unit: TUnit): Unit$DeploymentTracker<TUnit> {

    let tracker = this.#deploymentTrackers.get(unit.uid);

    if (!tracker) {
      this.#deploymentTrackers.set(unit.uid, tracker = new Unit$DeploymentTracker(this, unit));
    }

    return tracker as Unit$DeploymentTracker<TUnit>;
  }

  async executeTask<TUnit extends Unit>(unit: TUnit, task: OrderTask<TUnit>): Promise<void> {
    await task(this.unitDeployment(unit).context);
  }

  unitDeployment<TUnit extends Unit>(unit: TUnit): Unit$Deployment<TUnit> {

    let deployment = this.#deployments.get(unit.uid);

    if (!deployment) {
      deployment = new Unit$Deployment(this, unit);
      this.#deployments.set(unit.uid, deployment);
    }

    return deployment;
  }

  executeOrder(): Promise<void> {
    if (!this.#formationDeployed) {
      this.#formationDeployed = 1;
      this.formation.deploy(this.formation);
    }

    return this.workbench.executeOrder();
  }

}
