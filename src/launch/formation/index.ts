/**
 * @packageDocumentation
 * @module Module @sqdn/squadron/launch/formation
 */
import { Formation } from '../../formation';
import { Formation$Context } from '../../formation/formation.context.impl';
import { Hub } from '../../hub';
import { launchSqdn } from '../../impl';
import { Formation$createAssets } from '../../impl/formation';
import { SqdnLauncher } from '../sqdn-launcher';

export default function launchFormation(launcher: SqdnLauncher): void {
  launchSqdn(
      launcher,
      {
        getHub: () => new Hub({ id: launcher.launchData!.hubUid }),
        getFormation: () => new Formation({ id: launcher.launchData!.uid }),
        createContext(host, get, cxBuilder) {
          cxBuilder.provide(Formation$createAssets(launcher.launchData!));
          return new Formation$Context(host, get, cxBuilder);
        },
      },
  );
}
