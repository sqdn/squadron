import { cxBuildAsset } from '@proc7ts/context-builder';
import { CxAsset, CxEntry } from '@proc7ts/context-values';
import { Logger } from '@proc7ts/logger';
import { valueByRecipe } from '@proc7ts/primitives';
import { Formation$LaunchData } from '../../impl';
import { CommMethod } from '../comm-method';
import { CommProcessor } from '../comm-processor';
import { MessageCommChannel } from './message.comm-channel';

export function hubCommMethod(
    {
      processor = target => target.get(CommProcessor),
      logger = target => target.get(Logger),
    }: {
      processor?: CommProcessor | ((this: void, target: CxEntry.Target<CommMethod>) => CommProcessor);
      logger?: Logger | ((this: void, target: CxEntry.Target<CommMethod>) => Logger);
    } = {},
): CxAsset<CommMethod> {
  return cxBuildAsset(
      CommMethod,
      target => {

        const launchData = target.get(Formation$LaunchData, { or: null });

        if (!launchData) {
          return;
        }

        const commProcessor = valueByRecipe(processor, target);
        const commLogger = valueByRecipe(logger, target);
        const { hubUid, hubPort } = launchData;

        return {
          connect({ to, at }) {
            if (at.length !== 1) {
              return;
            }

            const [formation] = at;

            if (formation.uid !== hubUid || to.uid !== hubUid) {
              return;
            }

            return new MessageCommChannel({
              to,
              port: hubPort,
              processor: commProcessor,
              logger: commLogger,
            });
          },
        };
      },
  );
}
