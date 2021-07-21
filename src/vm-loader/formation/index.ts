/**
 * @packageDocumentation
 * @module Module @sqdn/squadron/vm-loader/formation
 */
import { lazyValue } from '@proc7ts/primitives';
import { Formation } from '../../formation';
import { FormationContext$create } from '../../formation/formation-context.impl';
import { initSquadronVM } from '../../impl';
import { SquadronVMLoader } from '../squadron-vm-loader';

export default function initFormationVM(loader: SquadronVMLoader): void {
  initSquadronVM(
      loader,
      {
        getFormation: lazyValue(() => new Formation()),
        createContext: FormationContext$create,
      },
  );
}
