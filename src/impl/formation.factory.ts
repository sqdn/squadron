import { CxBuilder } from '@proc7ts/context-builder';
import { CxAccessor } from '@proc7ts/context-values';
import { Formation, FormationContext } from '../formation';
import { Hub } from '../hub';
import { Formation$Host } from './formation.host';

export interface Formation$Factory {

  getHub(): Hub;

  getFormation(): Formation;

  createContext: (
      host: Formation$Host,
      get: CxAccessor,
      builder: CxBuilder<FormationContext>,
  ) => FormationContext;

}
