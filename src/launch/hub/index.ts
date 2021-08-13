/**
 * @packageDocumentation
 * @module Module @sqdn/squadron/launch/hub
 */
import { lazyValue } from '@proc7ts/primitives';
import { Formation$Context } from '../../formation/formation.context.impl';
import { Hub } from '../../hub';
import { launchSqdn } from '../../impl';
import { Hub$createAssets } from '../../impl/hub';
import { SqdnLauncher } from '../sqdn-launcher';

export default function launchHub(launcher: SqdnLauncher): void {
  launchSqdn(
      launcher,
      {
        getFormation: lazyValue(() => new Hub()),
        createContext(host, get, cxBuilder) {
          cxBuilder.provide(Hub$createAssets());
          return new Formation$Context(host, get, cxBuilder);
        },
      },
  );
}
