/**
 * Unit deployment status value.
 *
 * Available in {@link UnitContext.readStatus unit context}.
 */
export const enum UnitStatus {

  /**
   * The unit becomes idle when it arrives to formation, but its {@link Unit.instruct instructions} are not applied yet.
   */
  Idle,

  /**
   * The unit is instructed when its {@link Unit instruct instructions} applied, but its tasks
   * {@link OrderSubject.deploy deployment} is not completed yet.
   */
  Instructed,

  /**
   * The unit considered deployed when its {@link OrderSubject.deploy deployment tasks} execution completed.
   */
  Deployed,

  /**
   * The unit is ready for use after its deployment sequence completed.
   */
  Ready

}
