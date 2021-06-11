import { UnitLogger } from '../common';
import { Formation } from '../formation';
import { Unit } from './unit';
import { UnitTask } from './unit-task';
import { Unit$Workbench } from './unit.workbench.impl';

export interface Unit$Host {

  readonly log: UnitLogger;
  readonly workbench: Unit$Workbench;
  readonly formation: Formation;

  executeUnitTask<TUnit extends Unit>(unit: TUnit, task: UnitTask<TUnit>): Promise<void>;

}
