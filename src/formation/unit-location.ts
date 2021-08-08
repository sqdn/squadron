import { Formation } from './index';

/**
 * A location of the unit consists of formations the unit is deployed at.
 */
export interface UnitLocation {

  /**
   * Array of formations the unit deployed at.
   */
  readonly formations: readonly Formation[];

  /**
   * Checks whether the unit local, i.e. deployed at current formation.
   */
  readonly isLocal: boolean;

  /**
   * Checks whether the unit deployed at the given formation.
   *
   * @param formation - Target formation.
   *
   * @returns `true` if the unit deployed at target `formation`, or `false`otherwise.
   */
  isDeployedAt(formation: Formation): boolean;

}
