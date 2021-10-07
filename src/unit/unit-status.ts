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
   * {@link OrderSubject.run deployment} is not completed yet.
   */
  Instructed,

  /**
   * The unit considered executed when all of its {@link OrderSubject.run pending tasks} execution completes.
   */
  Executed,

  /**
   * The unit is ready for use when its deployment sequence completes.
   */
  Ready,

}
