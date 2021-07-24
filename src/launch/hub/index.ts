/**
 * @packageDocumentation
 * @module Module @sqdn/squadron/launch/hub
 */
import { lazyValue } from '@proc7ts/primitives';
import { Formation } from '../../formation';
import { FormationContext$create } from '../../formation/formation-context.impl';
import { launchSqdn } from '../../impl';
import { SqdnLauncher } from '../sqdn-launcher';

export default function launchHub(launcher: SqdnLauncher): void {
  launchSqdn(
      launcher,
      {
        getFormation: lazyValue(() => new Formation()),
        createContext: FormationContext$create,
      },
  );
}
