import { CxAsset } from '@proc7ts/context-values';
import { Formation$LaunchData } from '../formation.launch-data';
import { Formation$CommLinker } from './formation.comm-linker';
import { Formation$UnitLocator } from './formation.unit-locator';

export function Formation$createAssets(
  launchData: Formation$LaunchData,
): CxAsset<Formation$LaunchData> {
  return {
    entry: Formation$LaunchData,
    placeAsset(_target, collector) {
      collector(launchData);
    },
    setupAsset(target) {
      target.provide(Formation$UnitLocator);
      target.provide(Formation$CommLinker);
    },
  };
}
