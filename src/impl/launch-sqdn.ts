import { SqdnLauncher } from '../launch';
import { Formation$Factory } from './formation.factory';
import { Formation$Host } from './formation.host';

// istanbul ignore next
export function launchSqdn(loader: SqdnLauncher, formationFactory: Formation$Factory): void {
  loader.initOrder(new Formation$Host(formationFactory).order);
}
