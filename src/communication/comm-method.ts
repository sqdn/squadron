import { cxDynamic, CxEntry, cxScoped } from '@proc7ts/context-values';
import { Formation } from '../formation';
import { Unit, UnitContext } from '../unit';
import { CommChannel } from './comm-channel';

/**
 * Communication method responsible for establishing inter-unit connections.
 *
 * {@link Communicator} establishes connections by iterating over available connection methods.
 */
export interface CommMethod {

  /**
   * Tries to connects one unit to another. Creates communication channel if succeed.
   *
   * @param request - A request for connection to establish.
   *
   * @returns Either established communication channel, or `undefined` if connection can not be established by this
   * method.
   */
  connect(request: CommConnectionRequest): CommChannel | undefined;

}

/**
 * Communication connection request.
 *
 * Passed to {@link CommMethod.connect} in order to establish new inter-unit connection.
 */
export interface CommConnectionRequest {

  /**
   * Source unit that establishes connection.
   */
  readonly from: Unit;

  /**
   * Target unit to connect to.
   */
  readonly to: Unit;

  /**
   * Array of formations the target unit deployed at.
   */
  readonly at: readonly Formation[];

}

/**
 * Unit context entry containing communication method.
 *
 * The value of this entry combines all available communication methods.
 */
export const CommMethod: CxEntry<CommMethod> = {
  perContext: (/*#__PURE__*/ cxScoped(
      UnitContext,
      (/*#__PURE__*/ cxDynamic({
        create(methods, _target) {
          return {
            connect(request): CommChannel | void {
              for (let i = methods.length - 1; i >= 0; --i) {

                const channel = methods[i].connect(request);

                if (channel) {
                  return channel;
                }
              }
            },
          };
        },
        assign({ get, to }) {

          const method: CommMethod = {
            connect: request => get().connect(request),
          };

          return receiver => to((_, by) => receiver(method, by));
        },
      })),
  )),
  toString: () => '[CommMethod]',
};
