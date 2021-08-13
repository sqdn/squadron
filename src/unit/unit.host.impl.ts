import { Logger } from '@proc7ts/logger';
import { Formation } from '../formation';
import { Hub } from '../hub';
import { OrderTask } from '../order';
import { Unit } from './unit';
import { Unit$Workbench } from './unit.workbench.impl';

export interface Unit$Host {

  readonly log: Logger;
  readonly workbench: Unit$Workbench;
  readonly hub: Hub;
  readonly formation: Formation;

  deploy(formation: Formation, unit: Unit): void;

  executeTask<TUnit extends Unit>(unit: TUnit, task: OrderTask<TUnit>): Promise<void>;

}
