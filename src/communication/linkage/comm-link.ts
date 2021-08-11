import { Formation } from '../../formation';
import { Unit } from '../../unit';
import { CommChannel } from '../comm-channel';

/**
 * Communication link from current formation to another one.
 *
 * Used to establish communication {@link CommChannel channel} to unit deployed to target formation.
 *
 * Communication links obtained via {@link CommLinker communication linker}.
 */
export interface CommLink {

  /**
   * Target formation the link is established to.
   */
  readonly to: Formation;

  /**
   * Connects to unit deployed to target formation.
   *
   * It is an error trying to connect to a unit which is not deployed there.
   *
   * @param unit - Target unit.
   *
   * @returns New communication channel.
   */
  connect(unit: Unit): CommChannel;

}
