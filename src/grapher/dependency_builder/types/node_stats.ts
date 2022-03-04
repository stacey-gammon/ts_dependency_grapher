import { OrgScoreStats } from '../stats';

export interface NodeStats extends OrgScoreStats {
  // An indication of cohesion within this node.
  interDependencyCount: number;

  // afferent + efferent Coupling
  intraDependencyCount: number;

  afferentCoupling: number;

  efferentCoupling: number;
  /**
   * This is interDependencyCount - maxSingleCoupleWeight. It is a rough measure of whether this node fits in it's spot. If
   * it has a tighter connection to another node, than it does with it's own siblings, then it might be an indication is should move
   * there. > 0 is good, < 0 means potential for a better home.
   */
  orgScore: number;

  publicAPICount: number;

  /**
   * We need a way to determine when a module should be broken apart because there is too much complexity in a single node.
   */
  complexityScore: number;
}
