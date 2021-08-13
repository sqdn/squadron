import { CxEntry } from '@proc7ts/context-values';
import { Logger, logline } from '@proc7ts/logger';
import { noop } from '@proc7ts/primitives';
import { MessageChannel, Worker } from 'worker_threads';
import { CommChannel, MessageCommChannel } from '../../communication';
import { Formation } from '../../formation';
import { FormationStarter, FormationStartOptions } from '../../hub';
import { Formation$Host, Formation$LaunchData } from '../../impl';

export class Hub$FormationStarter implements FormationStarter {

  readonly #host: Formation$Host;
  readonly #logger: Logger;

  constructor(host: Formation$Host, target: CxEntry.Target<FormationStarter>) {
    this.#host = host;
    this.#logger = target.get(Logger);
  }

  startFormation(formation: Formation, { processor }: FormationStartOptions): CommChannel {

    const { port1, port2 } = new MessageChannel();
    const workerData: Formation$LaunchData = {
      uid: formation.uid,
      hubUid: this.#host.hub.uid,
      hubPort: port2,
    };
    const worker = new Worker(
        '@sqdn/squadron/launch/formation',
        {
          workerData,
          transferList: [port2],
        },
    );
    const channel = new MessageCommChannel({
      to: formation,
      port: port1,
      processor,
      logger: this.#logger,
    });

    this.#logger.info(logline`Starting ${formation} worker #${worker.threadId}`);
    worker.on('online', () => {
      this.#logger.info(`${formation} worker #${worker.threadId} online`);
    });
    worker.on('error', error => {
      this.#logger.error(`${formation} worker #${worker.threadId} execution failed`, error);
      channel.supply.off(error);
    });
    worker.on('exit', exitCode => {
      if (exitCode) {
        this.#logger.error(logline`${formation} worker #${worker.threadId} exited with code ${exitCode}`);
        channel.supply.off(new Error(`${formation} worker #${worker.threadId} exited with code ${exitCode}`));
      } else {
        this.#logger.info(logline`${formation} worker #${worker.threadId} exited`);
        channel.supply.off(void 0);
      }
    });
    channel.supply.whenOff(reason => {
      if (reason !== null) {
        this.#logger.error(logline`Aborting ${formation} worker #${worker.threadId}`, reason);
      } else {
        this.#logger.info(logline`Stopping ${formation} worker #${worker.threadId}`);
      }
      worker.terminate().catch(noop);
    });

    return channel;
  }

}
