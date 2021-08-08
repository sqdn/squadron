/**
 * @packageDocumentation
 * @module Module @sqdn/squadron/launch/formation
 */
import { cxConstAsset } from '@proc7ts/context-builder';
import { lazyValue } from '@proc7ts/primitives';
import { Formation } from '../../formation';
import { FormationContext$create } from '../../formation/formation-context.impl';
import { Formation$LaunchData, launchSqdn } from '../../impl';
import { FormationCommLinker, FormationUnitLocator } from '../../impl/formation';
import { SqdnLauncher } from '../sqdn-launcher';

export default function launchFormation(launcher: SqdnLauncher): void {
  launchSqdn(
      launcher,
      {
        getFormation: lazyValue(() => new Formation()),
        createContext(host, get, cxBuilder) {

          cxBuilder.provide(cxConstAsset(Formation$LaunchData, launcher.launchData));
          cxBuilder.provide(FormationUnitLocator);
          cxBuilder.provide(FormationCommLinker);

          return FormationContext$create(host, get, cxBuilder);
        },
      },
  );
}
