import { Logger } from '@proc7ts/logger';
import { Formation } from '../formation';
import { Unit } from './unit';
import { Unit$Deployment } from './unit.deployment.impl';
import { Unit$Workbench } from './unit.workbench.impl';

export interface Unit$Host {

  readonly workbench: Unit$Workbench;
  readonly log: Logger;

  unitDeployment<TUnit extends Unit>(unit: TUnit): Unit$Deployment<TUnit>;

  deploy(formation: Formation, unit: Unit): void;

}
