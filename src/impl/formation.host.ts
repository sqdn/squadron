import { CxBuilder, cxConstAsset, CxPeer, CxPeerBuilder } from '@proc7ts/context-builder';
import { CxAccessor, CxEntry, cxSingle } from '@proc7ts/context-values';
import { Logger } from '@proc7ts/logger';
import Order from '@sqdn/order';
import { Formation, FormationContext } from '../formation';
import { Unit, UnitContext, UnitTask } from '../unit';
import { Unit$Deployment } from '../unit/unit.deployment.impl';
import { Unit$Host } from '../unit/unit.host.impl';
import { Formation$Workbench } from './formation.workbench';

const Formation$Host$perContext: CxEntry.Definer<Formation$Host> = (/*#__PURE__*/ cxSingle());

export class Formation$Host implements Unit$Host {

  static perContext(target: CxEntry.Target<Formation$Host>): CxEntry.Definition<Formation$Host> {
    return Formation$Host$perContext(target);
  }

  static toString(): string {
    return '[Formation:Host]';
  }

  readonly workbench = new Formation$Workbench();
  readonly cxBuilder: CxBuilder<FormationContext>;
  readonly context: FormationContext;
  readonly perOrderCxPeer: CxPeerBuilder<Order>;
  readonly perUnitCxPeer: CxPeer<UnitContext>;

  private _formation: Formation | null = null;
  private readonly _deployments = new Map<string, Unit$Deployment<any>>();

  constructor(
      createContext: (
          host: Formation$Host,
          get: CxAccessor,
          builder: CxBuilder<FormationContext>,
      ) => FormationContext,
      private readonly _getFormation: () => Formation,
  ) {
    this.cxBuilder = new CxBuilder(
        (get, builder) => createContext(this, get, builder),
    );
    this.context = this.cxBuilder.context;

    this.perOrderCxPeer = new CxPeerBuilder<Order>(this.cxBuilder.boundPeer);
    this.perUnitCxPeer = new CxPeerBuilder<UnitContext>(this.cxBuilder.boundPeer);
  }

  get formation(): Formation {
    return this._formation ||= this._getFormation();
  }

  get log(): Logger {
    return this.context.get(Logger);
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

  newOrderBuilder(orderId: string): CxBuilder<Order> {
    return new CxBuilder<Order>(
        (get, builder) => {

          const order: Order = {
            entry: Order.entry,
            active: true,
            orderId,
            get,
          };

          builder.provide(cxConstAsset(Order.entry, order));

          return order;
        },
        this.perOrderCxPeer,
    );
  }

}
