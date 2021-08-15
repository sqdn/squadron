import { Formation } from '../formation';
import { Hub } from '../hub';

/**
 * An origin of the unit.
 */
export interface UnitOrigin {

  /**
   * The hub reference the unit created by.
   */
  readonly hub: Hub;

  /**
   * The formation reference the unit created in.
   */
  readonly formation: Formation;

}
