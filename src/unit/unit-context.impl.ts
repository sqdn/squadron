import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { Formation$Host } from '../impl';
import { Unit } from './unit';
import { UnitContext } from './unit-context';
import { UnitContext__entry } from './unit.entries.impl';

export function UnitContext$create<TUnit extends Unit>(host: Formation$Host, unit: TUnit): UnitContext<TUnit> {
  if (host.formation.uid === unit.uid) {
    return host.context as UnitContext;
  }

  const { formation } = host;
  const cxBuilder = new CxBuilder<UnitContext<TUnit>>(
      (get, builder) => {

        const context: UnitContext<TUnit> = {
          formation,
          unit,
          get,
        };

        builder.provide(cxConstAsset(UnitContext__entry, context));

        return context;
      },
      host.perUnitCxPeer,
  );

  return cxBuilder.context;
}
