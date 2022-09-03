import { CommChannel } from '../communication';
import { Formation } from '../formation';

export interface FormationCtl {
  readonly formation: Formation;

  readonly channel: CommChannel;
}
