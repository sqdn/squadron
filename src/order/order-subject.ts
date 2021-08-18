import { CxAsset, CxModifier, CxValues } from '@proc7ts/context-values';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { Formation } from '../formation';
import { Hub } from '../hub';
import { Unit, UnitContext } from '../unit';
import { OrderTask } from './order-task';

/**
 * A subject of order the {@link OrderInstruction instruction} is applied to.
 *
 * @typeParam TUnit - Type of deployed unit.
 */
export interface OrderSubject<TUnit extends Unit = Unit>
    extends CxValues, CxModifier<UnitContext<TUnit>>, SupplyPeer {

  /**
   * Central hub the formation controlled by.
   */
  readonly hub: Hub;

  /**
   * The formation the unit is deployed to.
   */
  readonly formation: Formation;

  /**
   * The deployed unit.
   */
  readonly unit: TUnit;

  /**
   * IoC context of deployed.
   */
  readonly context: UnitContext<TUnit>;

  /**
   * Order subject supply.
   *
   * Revokes the context values once cut off.
   */
  readonly supply: Supply;

  /**
   * Provides an asset for the entry of deployed unit {@link context}.
   *
   * @typeParam TValue - Context value type.
   * @typeParam TAsset - Context value asset type.
   * @param asset - Context entry asset.
   *
   * @returns Asset supply. Revokes provided asset once cut off.
   */
  provide<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, UnitContext<TUnit>>): Supply;

  execute(task: OrderTask<TUnit>): void;

}
