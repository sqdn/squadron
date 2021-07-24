import { Formation } from '../formation';
import { Unit } from '../unit';

/**
 * Central hub representation.
 *
 * A hub is a formation controlling other {@link Formation formations}.
 *
 * Hub's unique identifier is `hub` by default. So, multiple hub `Hub` instances would represent the same hub.
 */
export class Hub extends Formation {

  /**
   * Constructs a hub representation instance.
   *
   * @param init - Hub initialization options.
   */
  constructor(init?: Unit.Init) {
    super(Hub$init(init));
  }

}

function Hub$init(init: Unit.Init = {}): Unit.Init {
  return {
    ...init,
    id: init.id || 'hub',
  };
}
