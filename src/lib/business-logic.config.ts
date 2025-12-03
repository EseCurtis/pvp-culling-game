/**
 * Business Logic Configuration
 * 
 * Centralized configuration for XP system, battle costs, and game economy.
 * All limits, units, and quantities should be defined here for easy adjustment.
 */

export const businessLogicConfig = {
  /**
   * XP System Configuration
   */
  xp: {
    /**
     * XP cost required from challenger to initiate a battle
     * This XP is transferred to the defender's balance
     */
    battleCost: 5,

    /**
     * XP reward given to the winner of a battle
     * Winner receives this amount in addition to any transferred XP
     */
    winReward: 5,

    /**
     * Initial XP amount given to new users on signup
     * Should be enough for initialBattlesCount battles
     */
    initialAmount: 50, // 5 battles * 10 XP per battle

    /**
     * Number of battles the initial XP should cover
     * Used to calculate initialAmount if not explicitly set
     */
    initialBattlesCount: 5,
  },

  /**
   * Battle System Configuration
   */
  battle: {
    /**
     * Minimum XP required to initiate a challenge
     * Should match xp.battleCost
     */
    minXpRequired: 5, // Matches battleCost
  },
} as const;

/**
 * Helper function to get initial XP for new users
 * Calculates based on battle cost and initial battles count
 */
export function getInitialXp(): number {
  return (
    businessLogicConfig.xp.initialAmount ||
    businessLogicConfig.xp.battleCost * businessLogicConfig.xp.initialBattlesCount
  );
}

