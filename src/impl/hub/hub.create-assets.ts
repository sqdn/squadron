import { CxAsset } from '@proc7ts/context-values';
import { UnitLocator } from '../../formation';
import { Hub$CommLinker } from './hub.comm-linker';
import { Hub$FormationManager } from './hub.formation-manager';
import { Hub$UnitLocator } from './hub.unit-locator';

export function Hub$createAssets(): CxAsset<UnitLocator> {
  return {
    entry: UnitLocator,
    setupAsset(target) {
      target.provide(Hub$FormationManager);
      target.provide(Hub$CommLinker);
      target.provide(Hub$UnitLocator);
    },
  };
}
