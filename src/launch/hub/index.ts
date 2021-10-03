/**
 * @packageDocumentation
 * @module @sqdn/squadron/launch/hub
 */
import { cxBuildAsset } from '@proc7ts/context-builder';
import { Formation$Context } from '../../formation/formation.context.impl';
import { FormationStarter, Hub } from '../../hub';
import { launchSqdn } from '../../impl';
import { Hub$createAssets } from '../../impl/hub';
import { SqdnLauncher } from '../sqdn-launcher';
import { Hub$FormationStarter } from './hub.formation-starter';

export default function launchHub(launcher: SqdnLauncher): void {
  launchSqdn(
      launcher,
      {
        orderId: launcher.rootURL,
        createOrigin(order) {

          const hub = new Hub({ order });

          return {
            hub,
            formation: hub,
          };
        },
        createContext(host, get, cxBuilder) {
          cxBuilder.provide(Hub$createAssets());
          cxBuilder.provide(cxBuildAsset(FormationStarter, target => new Hub$FormationStarter(host, target)));

          return new Formation$Context(host, get, cxBuilder);
        },
      },
  );
}
