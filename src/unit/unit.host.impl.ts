import { Logger } from '@proc7ts/logger';
import { Formation } from '../formation';
import { Order$Workbench } from '../impl/order.workbench';
import { Unit } from './unit';
import { Unit$Deployment } from './unit.deployment.impl';

export interface Unit$Host {

  readonly workbench: Order$Workbench;
  readonly log: Logger;

  unitDeployment<TUnit extends Unit>(unit: TUnit): Unit$Deployment<TUnit>;

  deploy(formation: Formation, unit: Unit): void;

}
