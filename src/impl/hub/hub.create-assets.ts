import { CxAsset } from '@proc7ts/context-values';
import { UnitLocator } from '../../formation';
import { Hub$CommLinker } from './hub.comm-linker';
import { Hub$UnitLocator } from './hub.unit-locator';

export function Hub$createAssets(): CxAsset<UnitLocator> {
  return {
    entry: UnitLocator,
    setupAsset(target) {
      target.provide(Hub$UnitLocator);
      target.provide(Hub$CommLinker);
    },
  };
}
