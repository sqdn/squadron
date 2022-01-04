import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { MessagePort } from 'node:worker_threads';

export interface Formation$LaunchData {

  readonly uid: string;

  readonly hubUid: string;

  readonly hubPort: MessagePort;

}

export const Formation$LaunchData: CxEntry<Formation$LaunchData> = {
  perContext: (/*#__PURE__*/ cxSingle()),
  toString: () => '[Formation:LaunchData]',
};
