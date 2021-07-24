/**
 * @packageDocumentation
 * @module Module @sqdn/squadron/launch/hub
 */
import { lazyValue } from '@proc7ts/primitives';
import { FormationContext$create } from '../../formation/formation-context.impl';
import { Hub } from '../../hub';
import { launchSqdn } from '../../impl';
import { SqdnLauncher } from '../sqdn-launcher';

export default function launchHub(launcher: SqdnLauncher): void {
  launchSqdn(
      launcher,
      {
        getFormation: lazyValue(() => new Hub()),
        createContext: FormationContext$create,
      },
  );
}
