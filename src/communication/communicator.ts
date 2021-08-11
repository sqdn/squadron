import { CxEntry, cxScoped, cxSingle } from '@proc7ts/context-values';
import { Unit, UnitContext } from '../unit';
import { CommChannel } from './comm-channel';
import { Communicator$ } from './communicator.impl';

export interface Communicator {

  connect(to: Unit): CommChannel;

}

export const Communicator: CxEntry<Communicator> = {
  perContext: (/*#__PURE__*/ cxScoped(
      UnitContext,
      (/*#__PURE__*/ cxSingle({
        byDefault: target => new Communicator$(target.get(UnitContext)),
      })),
  )),
  toString: () => '[Communicator]',
};
