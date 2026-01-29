// ========================================
// A/B TESTING UTILITIES
// ========================================
// Helper functions for A/B testing implementation

/**
 * Assigns users to A/B test groups with consistent assignment
 * @param userId User identifier
 * @param testGroups Available test groups
 * @returns Assigned test group
 */
export function assignTestGroup(
  userId: string, 
  testGroups: string[] = ['A', 'B', 'C']
): string {
  // Simple hash-based assignment for consistency
  const hash = hashCode(userId);
  return testGroups[Math.abs(hash) % testGroups.length];
}

/**
 * Simple string hash function for consistent assignment
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * A/B testing configuration
 */
export const AB_TEST_CONFIG = {
  PROMPT_VARIANTS: {
    enabled: true,
    groups: ['A', 'B', 'C'],
    weights: {
      'A': 0.5,  // 50% control group
      'B': 0.25, // 25% test group 1
      'C': 0.25  // 25% test group 2
    }
  },
  METRICS: {
    trackResponseTime: true,
    trackResponseLength: true,
    trackContextUsage: true,
    trackUserEngagement: true // Future: feedback buttons
  }
};

/**
 * Gets A/B test group for current session
 */
export function getABTestGroup(): string {
  // Try to get from localStorage first
  const stored = localStorage.getItem('smartconnect_ab_test_group');
  if (stored) return stored;
  
  // Generate new assignment based on session ID
  const sessionId = sessionStorage.getItem('chat_session_id') || 'anonymous';
  const group = assignTestGroup(sessionId, AB_TEST_CONFIG.PROMPT_VARIANTS.groups);
  
  // Store for consistency
  localStorage.setItem('smartconnect_ab_test_group', group);
  
  return group;
}

/**
 * Resets A/B test group assignment
 */
export function resetABTestGroup(): void {
  localStorage.removeItem('smartconnect_ab_test_group');
}