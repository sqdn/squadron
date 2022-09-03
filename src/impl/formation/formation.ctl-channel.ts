import { CxEntry, cxScoped, cxSingle } from '@proc7ts/context-values';
import { Logger } from '@proc7ts/logger';
import { lazyValue } from '@proc7ts/primitives';
import {
  CommChannel,
  commProcessorBy,
  CommProtocol,
  MessageCommChannel,
  ProxyCommProcessor,
} from '../../communication';
import { FormationContext } from '../../formation';
import { Formation$LaunchData } from '../formation.launch-data';

export type Formation$CtlChannel = CommChannel;

export const Formation$CtlChannel: CxEntry<Formation$CtlChannel> = {
  perContext: /*#__PURE__*/ cxScoped(
    FormationContext,
    cxSingle({
      byDefault: target => {
        const context = target.get(FormationContext);
        const { hub: to } = context;
        const launchData = target.get(Formation$LaunchData);

        return new MessageCommChannel({
          to,
          port: launchData.hubPort,
          logger: target.get(Logger),
          processor: new ProxyCommProcessor(
            lazyValue(() => commProcessorBy(target.get(CommProtocol).channelProcessor(to))),
          ),
        });
      },
    }),
  ),
  toString: () => '[Formation:CtlChannel]',
};
