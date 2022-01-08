import { CxAsset, CxModifier, CxValues } from '@proc7ts/context-values';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { Formation, FormationContext } from '../formation';
import { Hub } from '../hub';
import { Unit, UnitContext } from '../unit';
import { OrderContext } from './order-context';
import { OrderTask } from './order-task';
import { OrderWithdrawalTask } from './order-withdrawal-task';

/**
 * A subject of order the {@link OrderInstruction instruction} is applied to.
 *
 * @typeParam TUnit - Type of deployed unit.
 */
export interface OrderSubject<TUnit extends Unit = Unit> extends CxValues, CxModifier<UnitContext<TUnit>>, SupplyPeer {

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
   * Once cut off, revokes all context values provided by this subject.
   *
   * Also initiates the subject {@link withdraw withdrawal}, unless initiated already. It is preferred to
   * {@link withdraw} the subject directly rather cut off this supply.
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

  /**
   * Provides an asset for the entry of {@link formation formation} context the unit deployed to.
   *
   * @typeParam TValue - Context value type.
   * @typeParam TAsset - Context value asset type.
   * @param asset - Context entry asset.
   *
   * @returns Asset supply. Revokes provided asset once cut off.
   */
  perFormation<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, FormationContext>): Supply;

  /**
   * Provides an asset for the entry of each order executed by unit {@link formation}.
   *
   * @typeParam TValue - Context value type.
   * @typeParam TAsset - Context value asset type.
   * @param asset - Context entry asset.
   *
   * @returns Asset supply. Revokes provided asset once cut off.
   */
  perOrder<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, OrderContext>): Supply;

  /**
   * Provides an asset for the entry of each unit deployed to the same {@link formation}.
   *
   * @typeParam TValue - Context value type.
   * @typeParam TAsset - Context value asset type.
   * @param asset - Context entry asset.
   *
   * @returns Asset supply. Revokes provided asset once cut off.
   */
  perUnit<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, UnitContext>): Supply;

  /**
   * Instructs the order to execute the given task.
   *
   * The task will start execution when all units arrived to the formation {@link Unit.instruct instructed}.
   *
   * @param task - The task to execute.
   */
  execute(task: OrderTask<TUnit>): void;

  /**
   * Instructs the order to execute the given task upon {@link withdraw subject withdrawal}.
   *
   * @param task - Withdrawal task to execute.
   */
  executeUponWithdrawal(task: OrderWithdrawalTask): void;

  /**
   * Initiates the order subject withdrawal, unless initiated already.
   *
   * Executes the {@link executeUponWithdrawal withdrawal tasks}, then cuts off the subject {@link supply} with the
   * given reason.
   *
   * @param reason - The reason of subject withdrawal.
   *
   * @returns A promise resolved when the subject withdrawn.
   */
  withdraw(reason?: unknown): Promise<void>;

}
