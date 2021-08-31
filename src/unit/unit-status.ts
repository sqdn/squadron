/**
 * Unit deployment status value.
 *
 * Available in {@link UnitContext.readStatus unit context}.
 */
export const enum UnitStatus {

  /**
   * The unit is arrived to formation, but its {@link Unit.instruct instructions} are not applied yet.
   */
  Arrived,

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
