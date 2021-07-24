import { SqdnLauncher } from '../launch';
import { Formation$Factory } from './formation.factory';
import { Formation$Host } from './formation.host';

// istanbul ignore next
export function launchSqdn(loader: SqdnLauncher, formationFactory: Formation$Factory): void {

  const host = new Formation$Host(formationFactory);

  loader.initOrder(host.newOrderBuilder(loader.rootURL).context);
}
