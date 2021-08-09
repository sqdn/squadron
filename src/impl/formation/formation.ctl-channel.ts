import { CxEntry, cxScoped, cxSingle } from '@proc7ts/context-values';
import { Logger } from '@proc7ts/logger';
import { CommChannel, MessageCommChannel } from '../../communication';
import { FormationContext } from '../../formation';
import { Hub } from '../../hub';
import { Formation$LaunchData } from '../formation.launch-data';

export type Formation$CtlChannel = CommChannel;

export const Formation$CtlChannel: CxEntry<Formation$CtlChannel> = {
  perContext: (/*#__PURE__*/ cxScoped(
      FormationContext,
      cxSingle({
        byDefault: target => {

          const launchData = target.get(Formation$LaunchData);

          return new MessageCommChannel({
            to: new Hub({ id: launchData.hubUid }),
            port: launchData.hubPort,
            logger: target.get(Logger),
          });
        },
      }),
  )),
  toString: () => '[Formation:CtlChannel]',
};
