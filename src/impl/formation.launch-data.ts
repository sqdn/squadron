import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { MessagePort } from 'worker_threads';

export interface Formation$LaunchData {

  readonly hubPort: MessagePort;

}

export const Formation$LaunchData: CxEntry<Formation$LaunchData> = {
  perContext: (/*#__PURE__*/ cxSingle()),
  toString: () => '[Formation:LaunchData]',
};
