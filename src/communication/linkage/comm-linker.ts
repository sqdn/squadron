import { CxEntry, cxScoped, cxSingle } from '@proc7ts/context-values';
import { Formation, FormationContext } from '../../formation';
import { CommLink } from './comm-link';

/**
 * Communication linker.
 *
 * Allows to {@link CommLink link} to other formation. The established link can be used to connect to units deployed to
 * target formation.
 *
 * The linker is used by {@link Communicator communicator} internally.
 */
export interface CommLinker {
  /**
   * Links to another formation.
   *
   * @param formation - Target formation to establish a link to.
   *
   * @returns Either new link, or already established one.
   */
  link(formation: Formation): CommLink;
}

/**
 * Formation context entry containing communication linker instance.
 */
export const CommLinker: CxEntry<CommLinker> = {
  perContext: /*#__PURE__*/ cxScoped(FormationContext, /*#__PURE__*/ cxSingle()),
  toString: () => '[CommLinker]',
};
