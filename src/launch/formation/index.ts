/**
 * @packageDocumentation
 * @module Module @sqdn/squadron/launch/formation
 */
import { lazyValue } from '@proc7ts/primitives';
import { Formation } from '../../formation';
import { FormationContext$create } from '../../formation/formation-context.impl';
import { launchSqdn } from '../../impl';
import { Formation$createAssets } from '../../impl/formation';
import { SqdnLauncher } from '../sqdn-launcher';

export default function launchFormation(launcher: SqdnLauncher): void {
  launchSqdn(
      launcher,
      {
        getFormation: lazyValue(() => new Formation({ id: launcher.launchData!.uid })),
        createContext(host, get, cxBuilder) {
          cxBuilder.provide(Formation$createAssets(launcher.launchData!));
          return FormationContext$create(host, get, cxBuilder);
        },
      },
  );
}
